-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  points INTEGER DEFAULT 0,
  total_swaps INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
  size TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('like-new', 'excellent', 'very-good', 'good', 'fair')),
  price DECIMAL(10,2) DEFAULT 0,
  points INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'swapped', 'flagged', 'deleted')),
  listing_type TEXT DEFAULT 'swap' CHECK (listing_type IN ('swap', 'donate', 'points')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
  emoji TEXT NOT NULL,
  item_name TEXT NOT NULL,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  swap_id UUID
);

-- Swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  offered_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  points_offered INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_price ON items(price);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_swaps_requester_id ON swaps(requester_id);
CREATE INDEX IF NOT EXISTS idx_swaps_owner_id ON swaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_swaps_item_id ON swaps(item_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_item_id ON reports(item_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_item_id ON likes(item_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_swaps_updated_at BEFORE UPDATE ON swaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
