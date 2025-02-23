import { createClient } from '@sanity/client'
import { kyllingWok } from '../recipes/kyllingwok'

// Configure your Sanity client
const client = createClient({
  projectId: 'nxq0o4ir', // Your project ID
  dataset: 'production',
  apiVersion: '2024-03-19', // Today's date
  token: process.env.SANITY_TOKEN,
  useCdn: false
})

// Function to import a single recipe
async function importRecipe(recipe: any) {
  try {
    const result = await client.create(recipe)
    console.log(`Successfully imported recipe: ${result.tittel}`)
    return result
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}

// Import all recipes
async function importAllRecipes() {
  try {
    // Add all recipes to this array as you create more
    const recipes = [kyllingWok]
    
    for (const recipe of recipes) {
      await importRecipe(recipe)
    }
    console.log('All recipes imported successfully!')
  } catch (error) {
    console.error('Failed to import recipes:', error)
  }
}

// Run the import
importAllRecipes() 