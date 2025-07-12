-- Create avatar table for storing user avatars
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  avatar_data TEXT NOT NULL, -- Base64 encoded canvas data
  clothing_items TEXT[] DEFAULT '{}', -- Array of equipped clothing emojis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_avatars_updated_at 
  BEFORE UPDATE ON user_avatars 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 