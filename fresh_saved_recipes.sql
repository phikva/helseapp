-- Drop the existing table completely
DROP TABLE IF EXISTS saved_recipes CASCADE;

-- Create a fresh saved_recipes table
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  CONSTRAINT unique_profile_recipe UNIQUE (profile_id, recipe_id),
  CONSTRAINT fk_profile
    FOREIGN KEY (profile_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_saved_recipes_profile_id ON saved_recipes(profile_id);
CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX idx_saved_recipes_is_favorite ON saved_recipes(is_favorite);

-- Enable RLS
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own saved recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own saved recipes"
  ON saved_recipes FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own saved recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = profile_id); 