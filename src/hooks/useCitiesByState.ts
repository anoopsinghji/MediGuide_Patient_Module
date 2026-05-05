import { useState, useEffect } from 'react';

interface UseCitiesByStateResult {
  cities: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch cities for a given Indian state using countriesNow API
 * @param state - The state name (e.g., "Maharashtra", "Tamil Nadu")
 * @returns Object with cities array, loading state, and error
 */
export const useCitiesByState = (state: string): UseCitiesByStateResult => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || state.trim() === '') {
      setCities([]);
      setError(null);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: 'India',
            state: state,
          }),
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.msg || 'Failed to fetch cities');
        }

        const payload = data?.data;
        const extractedCities = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.cities)
            ? payload.cities
            : [];

        if (extractedCities.length > 0) {
          const citiesList = [...extractedCities].sort();
          setCities(citiesList);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load cities. Please try again.'
        );
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to avoid too many API calls
    const timeoutId = setTimeout(fetchCities, 300);

    return () => clearTimeout(timeoutId);
  }, [state]);

  return { cities, loading, error };
};
