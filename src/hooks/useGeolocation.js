import { useEffect, useState } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get country from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          setLocation({
            country: data.countryName,
            countryCode: data.countryCode,
            city: data.city,
            region: data.principalSubdivision,
          });
        } catch (error) {
          setError("Failed to get location details");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  }, []);

  return { location, loading, error };
};
