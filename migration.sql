-- Add is_favorite column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'saved_recipes' 
        AND column_name = 'is_favorite'
    ) THEN 
        ALTER TABLE saved_recipes 
        ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
        
        -- Add comment to the column
        COMMENT ON COLUMN saved_recipes.is_favorite IS 'Flag indicating if the recipe is marked as favorite';
    END IF;
END $$; 