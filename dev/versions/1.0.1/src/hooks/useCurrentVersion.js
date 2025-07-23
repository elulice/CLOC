import { useState, useEffect } from 'react';

const useCurrentVersion = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const response = await fetch('/api/versions/current');
        if (!response.ok) {
          throw new Error('Error al obtener la versión actual');
        }
        const data = await response.json();
        setCurrentVersion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentVersion();
  }, []);

  return { currentVersion, loading, error };
};

export default useCurrentVersion; 