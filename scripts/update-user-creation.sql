-- Update User Creation and Handle Missing Users
-- This script ensures all users are properly created in the database

-- 1. Check for users that might be missing
SELECT 
    'Users in database:' as info,
    COUNT(*) as count
FROM users;

-- 2. Check for any items without valid users
SELECT 
    'Items without valid users:' as info,
    COUNT(*) as count
FROM items i
LEFT JOIN users u ON i.user_id = u.id
WHERE u.id IS NULL;

-- 3. If you have Clerk users that aren't in the database, you can manually insert them
-- Replace the values below with actual Clerk user data
-- Example (uncomment and modify as needed):

/*
INSERT INTO users (clerk_id, email, first_name, last_name, image_url, points, total_swaps, rating, role, bio, location) 
VALUES 
('user_2a1b3c4d5e6f', 'test@example.com', 'Test', 'User', '/placeholder.svg', 0, 0, 5.0, 'user', 'Test user', 'Test Location')
ON CONFLICT (clerk_id) DO NOTHING;
*/

-- 4. Update any items that have invalid user_id references
-- This will set user_id to NULL for items that reference non-existent users
UPDATE items 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM users);

-- 5. Verify the fixes
SELECT 
    'Items with valid users:' as info,
    COUNT(*) as count
FROM items i
JOIN users u ON i.user_id = u.id

UNION ALL

SELECT 
    'Items without users:' as info,
    COUNT(*) as count
FROM items 
WHERE user_id IS NULL;

-- 6. Show sample of users and their items
SELECT 
    'User activity summary:' as info,
    '' as details
FROM users 
WHERE FALSE

UNION ALL

SELECT 
    CONCAT(u.first_name, ' ', u.last_name),
    CONCAT('Items: ', COUNT(i.id), ' | Swaps: ', u.total_swaps, ' | Points: ', u.points)
FROM users u
LEFT JOIN items i ON u.id = i.user_id
GROUP BY u.id, u.first_name, u.last_name, u.total_swaps, u.points
ORDER BY COUNT(i.id) DESC
LIMIT 10; 