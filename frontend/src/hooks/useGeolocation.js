import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);    // { lat, lng }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setLoading(false);
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Activá el GPS.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coords, error, loading };
};

export default useGeolocation;
