-- Add coins column to profiles table
-- First, check if auth.users exists and create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add coins column if it doesn't exist (for existing profiles table)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coins') THEN
    ALTER TABLE public.profiles ADD COLUMN coins INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create tiles table
CREATE TABLE IF NOT EXISTS public.tiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  tile_type TEXT NOT NULL DEFAULT 'locked',
  unlock_cost INTEGER NOT NULL DEFAULT 100,
  user1_contribution INTEGER DEFAULT 0,
  user2_contribution INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_position UNIQUE (position_x, position_y)
);

-- Create index on position for faster lookups
CREATE INDEX IF NOT EXISTS tiles_position_idx ON public.tiles(position_x, position_y);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can see all profiles (for the game)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Tiles policies - everyone can see tiles
CREATE POLICY "Tiles are viewable by everyone" ON public.tiles
  FOR SELECT
  USING (true);

-- Only authenticated users can update tiles (contributions)
CREATE POLICY "Authenticated users can update tiles" ON public.tiles
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Initialize the 6x6 grid with default tiles
DO $$
DECLARE
  x INTEGER;
  y INTEGER;
  tile_types TEXT[] := ARRAY['road', 'house', 'shop', 'forest', 'park', 'building'];
  random_type TEXT;
  base_cost INTEGER;
BEGIN
  FOR x IN 0..5 LOOP
    FOR y IN 0..5 LOOP
      -- Check if tile already exists
      IF NOT EXISTS (SELECT 1 FROM public.tiles WHERE position_x = x AND position_y = y) THEN
        -- Pick a random tile type
        random_type := tile_types[1 + floor(random() * array_length(tile_types, 1))];
        
        -- Set unlock cost based on position (tiles further from origin cost more)
        base_cost := 50 + ((x + y) * 10);
        
        INSERT INTO public.tiles (position_x, position_y, tile_type, unlock_cost)
        VALUES (x, y, random_type, base_cost);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiles_updated_at BEFORE UPDATE ON public.tiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check if tile can be unlocked (both users contributed at least 50%)
CREATE OR REPLACE FUNCTION check_tile_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if both users have contributed at least 50% of the unlock cost
  IF NEW.user1_contribution >= (NEW.unlock_cost / 2.0) AND 
     NEW.user2_contribution >= (NEW.unlock_cost / 2.0) THEN
    NEW.is_unlocked := true;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tile_unlock_check BEFORE UPDATE ON public.tiles
  FOR EACH ROW EXECUTE FUNCTION check_tile_unlock();
