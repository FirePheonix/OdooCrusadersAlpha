-- Database Status Check
-- Run this to see the current state of your database

-- 1. Check users table
SELECT 
    'Users count:' as info,
    COUNT(*) as count
FROM users

UNION ALL

SELECT 
    'Users with items:' as info,
    COUNT(DISTINCT user_id) as count
FROM items;

-- 2. Check items table
SELECT 
    'Total items:' as info,
    COUNT(*) as count
FROM items

UNION ALL

SELECT 
    'Available items:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'available'

UNION ALL

SELECT 
    'Swapped items:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'swapped'

UNION ALL

SELECT 
    'Pending items:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'pending';

-- 3. Check swaps table
SELECT 
    'Total swaps:' as info,
    COUNT(*) as count
FROM swaps

UNION ALL

SELECT 
    'Completed swaps:' as info,
    COUNT(*) as count
FROM swaps 
WHERE status = 'completed'

UNION ALL

SELECT 
    'Pending swaps:' as info,
    COUNT(*) as count
FROM swaps 
WHERE status = 'pending';

-- 4. Check for orphaned items (items without users)
SELECT 
    'Items without users:' as info,
    COUNT(*) as count
FROM items 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'Items with invalid user_id:' as info,
    COUNT(*) as count
FROM items i
LEFT JOIN users u ON i.user_id = u.id
WHERE i.user_id IS NOT NULL AND u.id IS NULL;

-- 5. Check for items that should be swapped but aren't
SELECT 
    'Items in completed swaps but not marked swapped:' as info,
    COUNT(*) as count
FROM items i
WHERE i.id IN (
    SELECT DISTINCT item_id 
    FROM swaps 
    WHERE status = 'completed'
)
AND i.status != 'swapped';

-- 6. Show recent activity
SELECT 
    'Recent items (last 10):' as info,
    '' as details
FROM items 
WHERE FALSE

UNION ALL

SELECT 
    title,
    CONCAT('Status: ', status, ' | Created: ', created_at)
FROM items 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Show recent swaps
SELECT 
    'Recent swaps (last 10):' as info,
    '' as details
FROM swaps 
WHERE FALSE

UNION ALL

SELECT 
    CONCAT('Swap #', id),
    CONCAT('Status: ', status, ' | Created: ', created_at)
FROM swaps 
ORDER BY created_at DESC 
LIMIT 10; 