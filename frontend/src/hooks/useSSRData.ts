import { useEffect, useState } from 'react';

interface SSRData {
  featuredProducts?: any[];
  products?: any[];
  product?: any;
  page?: string;
}

export const useSSRData = () => {
  const [data, setData] = useState<SSRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have SSR data from window
    if (typeof window !== 'undefined') {
      const initialData = (window as any).__INITIAL_DATA__;
      const initialError = (window as any).__INITIAL_ERROR__;
      
      if (initialData) {
        setData(initialData);
      }
      if (initialError) {
        setError(initialError);
      }
      
      // Clean up global variables
      delete (window as any).__INITIAL_DATA__;
      delete (window as any).__INITIAL_ERROR__;
    }
  }, []);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, fetchData };
};
