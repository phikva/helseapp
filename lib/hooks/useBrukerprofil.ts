import { useQuery } from '@tanstack/react-query';
import { client } from '../sanity';
import {
  brukerprofilQuery,
  kostholdsbehovQuery,
  type KostholdsbehovItem,
  type BrukerprofilData,
} from '../queries/brukerprofilQueries';

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