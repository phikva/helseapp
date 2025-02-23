import groq from 'groq';

// Get all categories
export const getAllCategoriesQuery = groq`
  *[_type == "kategori"] {
    _id,
    name,
    "image": image.asset->url
  }
`;

// Get a single category by ID
export const getCategoryByIdQuery = groq`
  *[_type == "kategori" && _id == $id][0] {
    _id,
    name,
    "image": image.asset->url
  }
`;

// Get category with associated recipes
export const getCategoryWithRecipesQuery = groq`
  *[_type == "kategori" && _id == $id][0] {
    _id,
    name,
    "image": image.asset->url,
    "recipes": *[_type == "oppskrift" && references(^._id)] {
      _id,
      tittel,
      "image": image.asset->url,
      totalKcal,
      totalMakros
    }
  }
`; 