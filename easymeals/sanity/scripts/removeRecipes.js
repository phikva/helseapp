const { createClient } = require('@sanity/client');

// Initialize the Sanity client
const client = createClient({
  projectId: 'nxq0o4ir',
  dataset: 'production',
  token: 'sks0J3PkCGfm2fL2jC5nSzjOif3HdZZ7HMc7CXyt5bqcD7MrgsvMX3conx9AmWxAuqvGJ7s5d5Lou2br2DfM4PGdbCoECg78CT0xLcmwIyT4Njco9yWDvS3hFMTlcTTNTJ2UeA8gjZpVKXynWXAAHLNaxEEgMzcpr4M7uKlKDSNmHMiI4TYx',
  apiVersion: '2024-02-23',
  useCdn: false
});

// IDs of recipes to delete
const recipesToDelete = [
  // Draft version of "Frisk Laksesalat med Avokado"
  'drafts.FugAMOUH7ZxCCW8PcsdAbN',
  
  // Duplicate Kyllingwok - keeping the "Sunn" version
  '2ee3f533-a94e-40f6-94ea-101c6191375d',
  
  // Duplicate Laksewrap - keeping the "Sunn" version
  'I25ElKT6T8Mwntkt6jx1uQ',
  
  // Duplicate Quinoasalat - keeping the "Middelhavsinspirert" version
  'ppV89SJLkRfuVxE3tpAXo7'
];

async function deleteRecipes() {
  console.log('Starting recipe deletion process...');
  
  for (const recipeId of recipesToDelete) {
    try {
      // Get the recipe title before deleting
      const recipe = await client.fetch(`*[_id == $id][0]{tittel}`, { id: recipeId });
      
      if (recipe) {
        console.log(`Deleting recipe: ${recipe.tittel} (ID: ${recipeId})`);
        await client.delete(recipeId);
        console.log(`Successfully deleted recipe: ${recipe.tittel}`);
      } else {
        console.log(`Recipe with ID ${recipeId} not found.`);
      }
    } catch (error) {
      console.error(`Error deleting recipe with ID ${recipeId}:`, error.message);
    }
  }
  
  console.log('Recipe deletion process completed.');
}

// Execute the deletion process
deleteRecipes().catch(err => {
  console.error('An error occurred during the deletion process:', err);
  process.exit(1);
}); 