-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_recipes_profile_id ON saved_recipes(profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);

-- Add comments to columns
COMMENT ON COLUMN saved_recipes.id IS 'Unique identifier for saved recipe entry';
COMMENT ON COLUMN saved_recipes.profile_id IS 'Reference to the user profile';
COMMENT ON COLUMN saved_recipes.recipe_id IS 'Reference to the recipe in the content system';
COMMENT ON COLUMN saved_recipes.saved_at IS 'Timestamp when the recipe was saved';
COMMENT ON COLUMN saved_recipes.notes IS 'User notes about the recipe';
COMMENT ON COLUMN saved_recipes.is_favorite IS 'Flag indicating if the recipe is marked as favorite';
