import groq from 'groq'

// Get all recipes with basic information
export const getAllRecipesQuery = groq`
  *[_type == "oppskrift"] {
    _id,
    tittel,
    "image": image.asset->url,
    "kategorier": kategori[]->{ _id, name },
    totalKcal,
    totalMakros
  }
`

// Get a single recipe by ID with full details
export const getRecipeByIdQuery = groq`
  *[_type == "oppskrift" && _id == $id][0] {
    _id,
    tittel,
    "image": image.asset->url,
    beskrivelse,
    "kategorier": kategori[]->{ _id, name },
    "ingrediens": ingrediens[] {
      name,
      measurement {
        unit,
        unitQuantity
      },
      mengde,
      kcal,
      makros {
        protein,
        karbs,
        fett
      },
      kommentar
    },
    instruksjoner,
    notater,
    totalKcal,
    totalMakros,
    tilberedningstid
  }
`

// Get recipes by category ID
export const getRecipesByCategoryQuery = groq`
  *[_type == "oppskrift" && $categoryId in kategori[]._ref] {
    _id,
    tittel,
    "image": image.asset->url,
    totalKcal,
    totalMakros
  }
` 