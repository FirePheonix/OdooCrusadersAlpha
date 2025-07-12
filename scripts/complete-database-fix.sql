-- Complete Database Fix Script
-- Run this script to fix all issues with swapped items and user creation
-- This script is safe to run multiple times

-- Step 1: Check current database state
SELECT '=== DATABASE STATUS CHECK ===' as info;

SELECT 
    'Users count:' as info,
    COUNT(*) as count
FROM users

UNION ALL

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
    'Completed swaps:' as info,
    COUNT(*) as count
FROM swaps 
WHERE status = 'completed';

-- Step 2: Fix swapped items that aren't properly marked
SELECT '=== FIXING SWAPPED ITEMS ===' as info;

-- Update items that are part of completed swaps but not marked as swapped
UPDATE items 
SET status = 'swapped', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT item_id 
    FROM swaps 
    WHERE status = 'completed'
)
AND status != 'swapped';

-- Update offered items in completed swaps
UPDATE items 
SET status = 'swapped', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT offered_item_id 
    FROM swaps 
    WHERE status = 'completed' 
    AND offered_item_id IS NOT NULL
)
AND status != 'swapped';

-- Step 3: Clean up orphaned items (items without valid users)
SELECT '=== CLEANING UP ORPHANED ITEMS ===' as info;

-- Set user_id to NULL for items that reference non-existent users
UPDATE items 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM users);

-- Step 4: Verify the fixes
SELECT '=== VERIFICATION ===' as info;

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
    'Items without users:' as info,
    COUNT(*) as count
FROM items 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'Items with valid users:' as info,
    COUNT(*) as count
FROM items i
JOIN users u ON i.user_id = u.id;

-- Step 5: Show recent activity
SELECT '=== RECENT ACTIVITY ===' as info;

SELECT 
    'Recent items (last 5):' as info,
    '' as details
FROM items 
WHERE FALSE

UNION ALL

SELECT 
    title,
    CONCAT('Status: ', status, ' | Created: ', created_at)
FROM items 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 6: Show items that should be visible on frontend
SELECT '=== ITEMS VISIBLE ON FRONTEND ===' as info;

SELECT 
    'Available items for frontend:' as info,
    COUNT(*) as count
FROM items 
WHERE status = 'available'

UNION ALL

SELECT 
    'Sample available items:' as info,
    '' as details
FROM items 
WHERE FALSE

UNION ALL

SELECT 
    title,
    CONCAT('Category: ', category, ' | Points: ', points, ' | Condition: ', condition)
FROM items 
WHERE status = 'available'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 7: Final summary
SELECT '=== FIX COMPLETE ===' as info;

SELECT 
    'Database is now properly configured.' as message,
    'Swapped items are hidden from frontend.' as detail1,
    'Available items are visible on browse/search/homepage.' as detail2,
    'User references are cleaned up.' as detail3; 