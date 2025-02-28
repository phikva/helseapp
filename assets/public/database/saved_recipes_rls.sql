-- Enable Row Level Security for saved_recipes table
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own saved recipes
CREATE POLICY view_own_saved_recipes ON saved_recipes
    FOR SELECT
    USING (auth.uid() = profile_id);

-- Create policy to allow users to insert their own saved recipes
CREATE POLICY insert_own_saved_recipes ON saved_recipes
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Create policy to allow users to update their own saved recipes
CREATE POLICY update_own_saved_recipes ON saved_recipes
    FOR UPDATE
    USING (auth.uid() = profile_id);

-- Create policy to allow users to delete their own saved recipes
CREATE POLICY delete_own_saved_recipes ON saved_recipes
    FOR DELETE
    USING (auth.uid() = profile_id); 