import { useState, useEffect, useCallback } from 'react';

const useCurrentVersion = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentVersion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/versions/current');
      if (!response.ok) {
        throw new Error('Error al obtener la versión actual');
      }
      const data = await response.json();
      setCurrentVersion(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentVersion();
  }, [fetchCurrentVersion]);

  return { currentVersion, loading, error, refetchCurrentVersion: fetchCurrentVersion };
};

export default useCurrentVersion; 