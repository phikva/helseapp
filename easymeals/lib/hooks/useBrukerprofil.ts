import { useQuery } from '@tanstack/react-query';
import { client } from '@/sanity/lib/client';
import {
  brukerprofilQuery,
  kostholdsbehovQuery,
  allergierQuery,
  kjokkenTyperQuery,
  ingredienserQuery,
  type BrukerprofilData,
  type KostholdsbehovItem,
  type AllergiItem,
  type KjokkenType,
  type IngredientItem
} from '@/sanity/queries/brukerprofilQueries';

// Hook for fetching all profile settings
export function useBrukerprofil() {
  return useQuery<BrukerprofilData>({
    queryKey: ['brukerprofil'],
    queryFn: () => client.fetch(brukerprofilQuery)
  });
}

// Individual hooks for specific sections
export function useKostholdsbehov() {
  return useQuery<KostholdsbehovItem[]>({
    queryKey: ['brukerprofil', 'kostholdsbehov'],
    queryFn: () => client.fetch(kostholdsbehovQuery)
  });
}

export function useAllergier() {
  return useQuery<AllergiItem[]>({
    queryKey: ['brukerprofil', 'allergier'],
    queryFn: () => client.fetch(allergierQuery)
  });
}

export function useKjokkenTyper() {
  return useQuery<KjokkenType[]>({
    queryKey: ['brukerprofil', 'kjokkenTyper'],
    queryFn: () => client.fetch(kjokkenTyperQuery)
  });
}

export function useIngredienser() {
  return useQuery<IngredientItem[]>({
    queryKey: ['brukerprofil', 'ingredienser'],
    queryFn: () => client.fetch(ingredienserQuery)
  });
} 