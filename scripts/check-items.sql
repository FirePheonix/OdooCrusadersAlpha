-- Check items by status
SELECT status, COUNT(*) as count
FROM items
GROUP BY status
ORDER BY count DESC;

-- Show sample items with their status
SELECT id, title, status, created_at
FROM items
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any swapped items
SELECT id, title, status, user_id
FROM items
WHERE status = 'swapped'; 