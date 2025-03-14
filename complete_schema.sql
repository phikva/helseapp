-- Drop all tables with CASCADE to remove dependencies
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS dietary_requirements CASCADE;
DROP TABLE IF EXISTS allergies CASCADE;
DROP TABLE IF EXISTS food_preferences CASCADE;
DROP TABLE IF EXISTS budget_settings CASCADE;
DROP TABLE IF EXISTS portion_settings CASCADE;
DROP TABLE IF EXISTS saved_recipes CASCADE;

-- Create profiles table with UUID id to match Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  weight TEXT,
  height TEXT,
  age TEXT,
  subscription_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dependent tables with UUID profile_id
CREATE TABLE dietary_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requirement_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  allergy_name TEXT,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preference_type TEXT,
  preference_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE budget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC,
  period TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE portion_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  number_of_people INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  CONSTRAINT unique_profile_recipe UNIQUE (profile_id, recipe_id)
);

-- Add indexes for better performance
CREATE INDEX idx_dietary_requirements_profile_id ON dietary_requirements(profile_id);
CREATE INDEX idx_allergies_profile_id ON allergies(profile_id);
CREATE INDEX idx_food_preferences_profile_id ON food_preferences(profile_id);
CREATE INDEX idx_food_preferences_type ON food_preferences(preference_type);
CREATE INDEX idx_budget_settings_profile_id ON budget_settings(profile_id);
CREATE INDEX idx_portion_settings_profile_id ON portion_settings(profile_id);
CREATE INDEX idx_saved_recipes_profile_id ON saved_recipes(profile_id);
CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX idx_saved_recipes_is_favorite ON saved_recipes(is_favorite);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for dietary_requirements
CREATE POLICY "Users can view their own dietary requirements" ON dietary_requirements
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own dietary requirements" ON dietary_requirements
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own dietary requirements" ON dietary_requirements
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own dietary requirements" ON dietary_requirements
  FOR DELETE USING (auth.uid() = profile_id);

-- Create policies for allergies
CREATE POLICY "Users can view their own allergies" ON allergies
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own allergies" ON allergies
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own allergies" ON allergies
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own allergies" ON allergies
  FOR DELETE USING (auth.uid() = profile_id);

-- Create policies for food_preferences
CREATE POLICY "Users can view their own food preferences" ON food_preferences
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own food preferences" ON food_preferences
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own food preferences" ON food_preferences
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own food preferences" ON food_preferences
  FOR DELETE USING (auth.uid() = profile_id);

-- Create policies for budget_settings
CREATE POLICY "Users can view their own budget settings" ON budget_settings
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own budget settings" ON budget_settings
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own budget settings" ON budget_settings
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own budget settings" ON budget_settings
  FOR DELETE USING (auth.uid() = profile_id);

-- Create policies for portion_settings
CREATE POLICY "Users can view their own portion settings" ON portion_settings
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own portion settings" ON portion_settings
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own portion settings" ON portion_settings
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own portion settings" ON portion_settings
  FOR DELETE USING (auth.uid() = profile_id);

-- Create policies for saved_recipes
CREATE POLICY "Users can view their own saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own saved recipes" ON saved_recipes
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own saved recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own saved recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = profile_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 