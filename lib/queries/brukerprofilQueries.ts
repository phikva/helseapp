import groq from 'groq'

// Types for the query responses
export interface KostholdsbehovItem {
  navn: string;
  verdi: string;
  beskrivelse?: string;
}

export interface AllergiItem {
  navn: string;
  beskrivelse?: string;
}

export interface KjokkenType {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface IngredientItem {
  navn: string;
  kategori: string;
  beskrivelse?: string;
}

// Query to get all profile settings
export const brukerprofilQuery = groq`*[_type == "brukerprofil"][0] {
  kostholdsbehov[] {
    navn,
    verdi,
    beskrivelse
  },
  vanligeAllergier[] {
    navn,
    beskrivelse
  },
  kjokkenTyper[]-> {
    _id,
    name,
    description,
    "imageUrl": image.asset->url
  },
  vanligeIngredienser[] {
    navn,
    kategori,
    beskrivelse
  }
}`

// Individual queries for specific sections
export const kostholdsbehovQuery = groq`*[_type == "brukerprofil"][0].kostholdsbehov[] {
  navn,
  verdi,
  beskrivelse
}`

export const allergierQuery = groq`*[_type == "brukerprofil"][0].vanligeAllergier[] {
  navn,
  beskrivelse
}`

export const kjokkenTyperQuery = groq`*[_type == "brukerprofil"][0].kjokkenTyper[]-> {
  _id,
  name,
  description,
  "imageUrl": image.asset->url
}`

export const ingredienserQuery = groq`*[_type == "brukerprofil"][0].vanligeIngredienser[] {
  navn,
  kategori,
  beskrivelse
}` 