const { createClient } = require('@sanity/client')

// Configure Sanity client
const client = createClient({
  projectId: 'nxq0o4ir',
  dataset: 'production',
  token: 'sks0J3PkCGfm2fL2jC5nSzjOif3HdZZ7HMc7CXyt5bqcD7MrgsvMX3conx9AmWxAuqvGJ7s5d5Lou2br2DfM4PGdbCoECg78CT0xLcmwIyT4Njco9yWDvS3hFMTlcTTNTJ2UeA8gjZpVKXynWXAAHLNaxEEgMzcpr4M7uKlKDSNmHMiI4TYx',
  apiVersion: '2024-02-23',
  useCdn: false,
})

// Check for recipes without categories
async function checkRecipesWithoutCategories() {
  try {
    // Fetch all recipes without categories or with empty category arrays
    const query = `*[_type == "oppskrift" && (defined(kategori) == false || count(kategori) == 0)]`;
    const recipes = await client.fetch(query);
    
    console.log(`Found ${recipes.length} recipes without categories.`);
    
    if (recipes.length > 0) {
      console.log('Recipes without categories:');
      recipes.forEach(recipe => {
        console.log(`- ${recipe.tittel}`);
      });
    } else {
      console.log('All recipes have categories assigned!');
    }
    
    // Also check total number of recipes
    const totalQuery = `count(*[_type == "oppskrift"])`;
    const totalRecipes = await client.fetch(totalQuery);
    console.log(`\nTotal number of recipes in the database: ${totalRecipes}`);
    
    // Check recipes with categories
    const withCategoriesQuery = `*[_type == "oppskrift" && defined(kategori) && count(kategori) > 0]{tittel, "categoryCount": count(kategori)}`;
    const recipesWithCategories = await client.fetch(withCategoriesQuery);
    console.log(`Number of recipes with categories: ${recipesWithCategories.length}`);
    
    // Show category distribution
    console.log('\nCategory distribution:');
    const categoryQuery = `*[_type == "kategori"]{name, "count": count(*[_type == "oppskrift" && references(^._id)])}`;
    const categoryDistribution = await client.fetch(categoryQuery);
    categoryDistribution.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.count} recipes`);
    });
    
  } catch (error) {
    console.error('Error checking recipes:', error);
  }
}

// Run the check
checkRecipesWithoutCategories(); 