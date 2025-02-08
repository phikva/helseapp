import { useEffect, useState } from 'react';
import { client } from '@/lib/sanity';

export function useSanityQuery<T>(query: string, params?: Record<string, any>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await client.fetch<T>(query, params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, JSON.stringify(params)]);

  return { data, loading, error };
} 