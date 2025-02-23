const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

// Read all recipe data
const recipesDir = path.join(__dirname, '../recipes')
const recipeFiles = fs.readdirSync(recipesDir).filter(file => file.endsWith('-data.json'))
const recipes = recipeFiles.map(file => {
  const data = fs.readFileSync(path.join(recipesDir, file), 'utf8')
  return JSON.parse(data)
})

const client = createClient({
  projectId: 'nxq0o4ir',
  dataset: 'production',
  token: 'sks0J3PkCGfm2fL2jC5nSzjOif3HdZZ7HMc7CXyt5bqcD7MrgsvMX3conx9AmWxAuqvGJ7s5d5Lou2br2DfM4PGdbCoECg78CT0xLcmwIyT4Njco9yWDvS3hFMTlcTTNTJ2UeA8gjZpVKXynWXAAHLNaxEEgMzcpr4M7uKlKDSNmHMiI4TYx',
  apiVersion: '2024-02-23',
  useCdn: false,
})

async function importRecipes() {
  try {
    for (const recipe of recipes) {
      const result = await client.create(recipe)
      console.log('Recipe imported successfully:', result.tittel)
    }
    console.log('\nAll recipes have been imported!')
  } catch (error) {
    console.error('Import failed:', error)
  }
}

importRecipes() 