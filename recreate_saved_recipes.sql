-- First, create a temporary table with the basic structure
CREATE TABLE IF NOT EXISTS saved_recipes_temp (
  id UUID,
  profile_id UUID,
  recipe_id TEXT,
  notes TEXT,
  is_favorite BOOLEAN
);

-- Copy existing data, converting profile_id to UUID and handling missing columns
INSERT INTO saved_recipes_temp (id, profile_id, recipe_id)
SELECT 
  id,
  profile_id::uuid as profile_id,
  recipe_id
FROM saved_recipes;

-- Drop existing table and its dependencies
DROP TABLE IF EXISTS saved_recipes CASCADE;

-- Recreate saved_recipes table with all columns
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL, -- Sanity CMS recipe ID
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT, -- Optional notes the user can add about the recipe
  is_favorite BOOLEAN DEFAULT FALSE, -- Flag for favorite recipes
  
  -- Ensure a user can't save the same recipe twice
  CONSTRAINT unique_profile_recipe UNIQUE (profile_id, recipe_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_recipes_profile_id ON saved_recipes(profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_is_favorite ON saved_recipes(is_favorite);

-- Add comment to the table
COMMENT ON TABLE saved_recipes IS 'Stores recipes saved by users to their profiles';

-- Enable Row Level Security
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY view_own_saved_recipes ON saved_recipes
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY insert_own_saved_recipes ON saved_recipes
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY update_own_saved_recipes ON saved_recipes
    FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY delete_own_saved_recipes ON saved_recipes
    FOR DELETE
    USING (auth.uid() = profile_id);

-- Restore data from backup if it exists, setting saved_at to current timestamp
INSERT INTO saved_recipes (id, profile_id, recipe_id, saved_at)
SELECT 
  id,
  profile_id,
  recipe_id,
  NOW() as saved_at
FROM saved_recipes_temp
WHERE profile_id IS NOT NULL -- Only insert rows where profile_id is valid
ON CONFLICT DO NOTHING;

-- Drop temporary table
DROP TABLE IF EXISTS saved_recipes_temp; 