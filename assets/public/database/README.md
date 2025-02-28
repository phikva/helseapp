# Supabase Database Setup

This directory contains SQL files for setting up the database schema and Row Level Security (RLS) policies for the HelseApp application.

## Row Level Security (RLS) Policies

The application uses Row Level Security to ensure that users can only access their own data. The following files contain RLS policies:

- `saved_recipes_rls.sql`: Contains RLS policies for the saved_recipes table

## How to Apply RLS Policies

To apply the RLS policies to your Supabase database, follow these steps:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `saved_recipes_rls.sql` file
5. Run the query

Alternatively, you can use the Supabase CLI to apply the policies:

```bash
supabase db push
```

## Troubleshooting RLS Issues

If you encounter errors like:

```
Error saving recipe: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy for table \"saved_recipes\""}
```

This means that the RLS policies are preventing the operation. Check the following:

1. Make sure the user is authenticated
2. Ensure the user ID in the request matches the authenticated user ID
3. Verify that the RLS policies have been applied correctly
4. Check that the user has the necessary permissions

## Database Schema

The database schema is defined in the following files:

- `saved_recipes.sql`: Contains the schema for the saved_recipes table
- `profiles_schema.sql`: Contains the schema for the profiles table

## Data

Sample data is provided in the following files:

- `profiles_rows.sql`: Contains sample data for the profiles table
- `allergies_rows.sql`: Contains sample data for allergies
- `dietary_requirements_rows.sql`: Contains sample data for dietary requirements
- `food_preferences_rows.sql`: Contains sample data for food preferences
- `portion_settings_rows.sql`: Contains sample data for portion settings
- `budget_settings_rows.sql`: Contains sample data for budget settings 