-- Fix swapped items visibility
-- This script updates the database to ensure swapped items are properly marked and filtered

-- 1. First, let's check current item statuses
SELECT 
    id,
    title,
    status,
    created_at,
    updated_at
FROM items 
ORDER BY created_at DESC;

-- 2. Update any items that should be marked as swapped but aren't
-- This finds items that are part of completed swaps and marks them as swapped
UPDATE items 
SET status = 'swapped', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT item_id 
    FROM swaps 
    WHERE status = 'completed'
)
AND status != 'swapped';

-- 3. Also update offered items in completed swaps
UPDATE items 
SET status = 'swapped', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT offered_item_id 
    FROM swaps 
    WHERE status = 'completed' 
    AND offered_item_id IS NOT NULL
)
AND status != 'swapped';

-- 4. Verify the changes
SELECT 
    'Items marked as swapped:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'swapped'

UNION ALL

SELECT 
    'Available items:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'available'

UNION ALL

SELECT 
    'Total items:' as info,
    COUNT(*) as count
FROM items;

-- 5. Show sample of swapped items
SELECT 
    id,
    title,
    status,
    created_at
FROM items 
WHERE status = 'swapped'
ORDER BY updated_at DESC
LIMIT 10;

-- 6. Show sample of available items
SELECT 
    id,
    title,
    status,
    created_at
FROM items 
WHERE status = 'available'
ORDER BY created_at DESC
LIMIT 10; 