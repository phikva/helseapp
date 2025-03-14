const { createClient } = require('@sanity/client')

// Configure Sanity client
const client = createClient({
  projectId: 'nxq0o4ir',
  dataset: 'production',
  token: 'sks0J3PkCGfm2fL2jC5nSzjOif3HdZZ7HMc7CXyt5bqcD7MrgsvMX3conx9AmWxAuqvGJ7s5d5Lou2br2DfM4PGdbCoECg78CT0xLcmwIyT4Njco9yWDvS3hFMTlcTTNTJ2UeA8gjZpVKXynWXAAHLNaxEEgMzcpr4M7uKlKDSNmHMiI4TYx',
  apiVersion: '2024-02-23',
  useCdn: false,
})

/**
 * Add portions field to all recipes that don't have it
 */
async function addPortionsToRecipes() {
  try {
    // Fetch all recipes without a portions field
    const query = `*[_type == "oppskrift" && !defined(porsjoner)]`
    const recipes = await client.fetch(query)
    
    console.log(`Found ${recipes.length} recipes without portions field`)
    
    // Add default portions (4) to each recipe
    let updatedCount = 0
    
    for (const recipe of recipes) {
      try {
        const result = await client
          .patch(recipe._id)
          .set({ porsjoner: 4 }) // Default to 4 portions
          .commit()
        
        console.log(`Updated recipe: ${result.tittel}`)
        updatedCount++
      } catch (error) {
        console.error(`Failed to update recipe ${recipe.tittel || recipe._id}:`, error)
      }
    }
    
    console.log(`\nUpdate complete: ${updatedCount} recipes updated`)
  } catch (error) {
    console.error('Script failed:', error)
  }
}

// Run the script
addPortionsToRecipes() 