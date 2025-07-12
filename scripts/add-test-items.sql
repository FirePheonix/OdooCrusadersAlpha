-- Add test items to the database
-- First, get a user ID (replace with an actual user ID from your database)
-- You can get this by running: SELECT id FROM users LIMIT 1;

-- Add test items
INSERT INTO items (user_id, title, description, category, size, condition, price, points, tags, images, status, listing_type, views, likes) VALUES
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your database
('YOUR_USER_ID_HERE', 'Vintage Leather Jacket', 'Classic vintage leather jacket in excellent condition. Perfect for adding edge to any outfit.', 'outerwear', 'M', 'excellent', 0, 45, ARRAY['vintage', 'leather', 'classic'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 24, 5),
('YOUR_USER_ID_HERE', 'Designer Silk Dress', 'Elegant silk dress perfect for special occasions. Barely worn and in pristine condition.', 'dresses', 'S', 'like-new', 0, 35, ARRAY['designer', 'silk', 'elegant'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 18, 8),
('YOUR_USER_ID_HERE', 'Casual Denim Jeans', 'Comfortable denim jeans with perfect fit. Great for everyday wear.', 'bottoms', '32', 'good', 0, 20, ARRAY['denim', 'casual', 'comfortable'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 15, 3),
('YOUR_USER_ID_HERE', 'Wool Winter Sweater', 'Cozy merino wool sweater for cold days. Warm and stylish.', 'tops', 'L', 'very-good', 0, 30, ARRAY['wool', 'winter', 'cozy'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 31, 11),
('YOUR_USER_ID_HERE', 'Athletic Running Shoes', 'Comfortable running shoes in great condition. Perfect for workouts.', 'shoes', '9', 'good', 0, 25, ARRAY['athletic', 'running', 'comfortable'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 19, 4),
('YOUR_USER_ID_HERE', 'Elegant Evening Bag', 'Beautiful evening bag perfect for special occasions.', 'accessories', 'One Size', 'excellent', 0, 18, ARRAY['elegant', 'evening', 'accessories'], ARRAY['https://res.cloudinary.com/dme4a3vdr/image/upload/v1752302057/rewear-items/placeholder.jpg'], 'available', 'swap', 12, 2);

-- To get your user ID, run this first:
-- SELECT id FROM users WHERE clerk_id = 'your_clerk_user_id_here'; 