-- Update profiles table to include subscription_id
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Add comment to the subscription_id column
COMMENT ON COLUMN profiles.subscription_id IS 'Reference to the Sanity subscription document ID';

-- Create an index on subscription_id for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id); 