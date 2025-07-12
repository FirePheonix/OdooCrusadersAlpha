-- Insert sample users
INSERT INTO users (clerk_id, email, first_name, last_name, image_url, points, total_swaps, rating, role, bio, location) VALUES
('user_1', 'sarah@example.com', 'Sarah', 'Johnson', '/placeholder.svg?height=100&width=100', 125, 12, 4.9, 'user', 'Sustainable fashion enthusiast who loves vintage finds!', 'San Francisco, CA'),
('user_2', 'mike@example.com', 'Mike', 'Rodriguez', '/placeholder.svg?height=100&width=100', 89, 8, 4.7, 'user', 'Minimalist wardrobe advocate. Quality over quantity!', 'Austin, TX'),
('user_3', 'emma@example.com', 'Emma', 'Wilson', '/placeholder.svg?height=100&width=100', 156, 15, 4.8, 'user', 'Fashion designer promoting circular economy.', 'New York, NY'),
('user_4', 'alex@example.com', 'Alex', 'Thompson', '/placeholder.svg?height=100&width=100', 67, 5, 4.6, 'user', 'College student building a sustainable closet.', 'Boston, MA'),
('admin_1', 'admin@rewear.com', 'Admin', 'User', '/placeholder.svg?height=100&width=100', 0, 0, 5.0, 'admin', 'Platform administrator', 'Remote');

-- Insert sample items
INSERT INTO items (user_id, title, description, category, size, condition, price, points, tags, images, status, listing_type, views, likes) VALUES
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'Vintage Wool Socks', 'Cozy vintage wool socks in excellent condition. Perfect for winter!', 'accessories', 'M', 'excellent', 15.00, 12, ARRAY['vintage', 'wool', 'warm'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 24, 5),
((SELECT id FROM users WHERE email = 'mike@example.com'), 'Organic Cotton T-Shirt', 'Soft organic cotton t-shirt in navy blue. Barely worn!', 'tops', 'L', 'like-new', 25.00, 20, ARRAY['organic', 'cotton', 'casual'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 18, 8),
((SELECT id FROM users WHERE email = 'emma@example.com'), 'Designer Denim Trousers', 'High-quality designer jeans with perfect fit and style.', 'bottoms', '32', 'very-good', 45.00, 35, ARRAY['designer', 'denim', 'classic'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'points', 32, 12),
((SELECT id FROM users WHERE email = 'alex@example.com'), 'Leather Winter Gloves', 'Genuine leather gloves, perfect for cold weather.', 'accessories', 'L', 'good', 30.00, 25, ARRAY['leather', 'winter', 'warm'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 15, 3),
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'Knitted Beanie Hat', 'Hand-knitted wool beanie in forest green.', 'accessories', 'One Size', 'excellent', 20.00, 15, ARRAY['knitted', 'wool', 'handmade'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'donate', 28, 7),
((SELECT id FROM users WHERE email = 'mike@example.com'), 'Vintage Leather Jacket', 'Classic leather jacket with timeless style.', 'outerwear', 'M', 'very-good', 85.00, 65, ARRAY['vintage', 'leather', 'classic'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 45, 15),
((SELECT id FROM users WHERE email = 'emma@example.com'), 'Silk Summer Dress', 'Elegant silk dress perfect for special occasions.', 'dresses', 'S', 'like-new', 60.00, 45, ARRAY['silk', 'elegant', 'summer'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'points', 22, 9),
((SELECT id FROM users WHERE email = 'alex@example.com'), 'Running Sneakers', 'Comfortable running shoes in great condition.', 'shoes', '9', 'good', 35.00, 28, ARRAY['athletic', 'comfortable', 'running'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 19, 4),
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'Designer Handbag', 'Luxury designer handbag in pristine condition.', 'accessories', 'One Size', 'excellent', 120.00, 95, ARRAY['designer', 'luxury', 'handbag'], ARRAY['/placeholder.svg?height=300&width=300'], 'flagged', 'points', 67, 23),
((SELECT id FROM users WHERE email = 'mike@example.com'), 'Wool Winter Sweater', 'Cozy merino wool sweater for cold days.', 'tops', 'L', 'very-good', 40.00, 32, ARRAY['wool', 'winter', 'cozy'], ARRAY['/placeholder.svg?height=300&width=300'], 'available', 'swap', 31, 11);

-- Insert sample user tokens
INSERT INTO user_tokens (user_id, item_type, emoji, item_name) VALUES
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'accessories', '🧢', 'Baseball Cap'),
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'accessories', '🧤', 'Winter Gloves'),
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'accessories', '🧦', 'Wool Socks'),
((SELECT id FROM users WHERE email = 'mike@example.com'), 'accessories', '🎩', 'Top Hat'),
((SELECT id FROM users WHERE email = 'emma@example.com'), 'accessories', '🧤', 'Leather Gloves'),
((SELECT id FROM users WHERE email = 'emma@example.com'), 'accessories', '🧦', 'Cotton Socks'),
((SELECT id FROM users WHERE email = 'alex@example.com'), 'accessories', '🧢', 'Beanie');

-- Insert sample swaps
INSERT INTO swaps (requester_id, owner_id, item_id, status, message) VALUES
((SELECT id FROM users WHERE email = 'mike@example.com'), (SELECT id FROM users WHERE email = 'sarah@example.com'), (SELECT id FROM items WHERE title = 'Vintage Wool Socks'), 'pending', 'Hi! I love these socks. Would you be interested in swapping?'),
((SELECT id FROM users WHERE email = 'emma@example.com'), (SELECT id FROM users WHERE email = 'alex@example.com'), (SELECT id FROM items WHERE title = 'Leather Winter Gloves'), 'completed', 'Great transaction! Thanks for the gloves.'),
((SELECT id FROM users WHERE email = 'alex@example.com'), (SELECT id FROM users WHERE email = 'mike@example.com'), (SELECT id FROM items WHERE title = 'Organic Cotton T-Shirt'), 'accepted', 'Perfect! When can we arrange the swap?');

-- Insert sample reports
INSERT INTO reports (reporter_id, item_id, reason, description, status) VALUES
((SELECT id FROM users WHERE email = 'mike@example.com'), (SELECT id FROM items WHERE title = 'Designer Handbag'), 'Inappropriate content', 'This item appears to be counterfeit based on the photos.', 'pending'),
((SELECT id FROM users WHERE email = 'alex@example.com'), (SELECT id FROM items WHERE title = 'Designer Handbag'), 'Misleading description', 'The condition described does not match the photos.', 'pending'),
((SELECT id FROM users WHERE email = 'emma@example.com'), (SELECT id FROM items WHERE title = 'Designer Handbag'), 'Suspicious listing', 'Price seems too good to be true for authentic designer item.', 'pending');

-- Insert sample likes
INSERT INTO likes (user_id, item_id) VALUES
((SELECT id FROM users WHERE email = 'mike@example.com'), (SELECT id FROM items WHERE title = 'Vintage Wool Socks')),
((SELECT id FROM users WHERE email = 'emma@example.com'), (SELECT id FROM items WHERE title = 'Vintage Wool Socks')),
((SELECT id FROM users WHERE email = 'alex@example.com'), (SELECT id FROM items WHERE title = 'Organic Cotton T-Shirt')),
((SELECT id FROM users WHERE email = 'sarah@example.com'), (SELECT id FROM items WHERE title = 'Designer Denim Trousers')),
((SELECT id FROM users WHERE email = 'mike@example.com'), (SELECT id FROM items WHERE title = 'Knitted Beanie Hat'));

-- Update item report counts and flagged status
UPDATE items SET 
  report_count = (SELECT COUNT(*) FROM reports WHERE reports.item_id = items.id),
  flagged = (SELECT COUNT(*) FROM reports WHERE reports.item_id = items.id) > 0;
