import { useEffect, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import { UberContext } from '../context/uberContext';

const style = {
  wrapper: `flex-1 h-full w-full absolute bottom-0`,
};

const Map = () => {
  const { pickupCoordinates, dropoffCoordinates } = useContext(UberContext);

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("Mapbox access token is missing. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.");
      return;
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/atl5d/cm0kb0y3u023x01qrfehze7qx', // Custom Mapbox style
      center: [-74.3419, 39.6032], // Centered on Tuckerton, NJ
      zoom: 12,
    });

    if (pickupCoordinates) {
      addToMap(map, pickupCoordinates);
    }

    if (dropoffCoordinates) {
      addToMap(map, dropoffCoordinates);
    }

    if (pickupCoordinates && dropoffCoordinates) {
      map.fitBounds([dropoffCoordinates, pickupCoordinates], {
        padding: 400,
      });
    }

    return () => map.remove(); // Cleanup on unmount

  }, [pickupCoordinates, dropoffCoordinates]);

  const addToMap = (map, coordinates) => {
    if (coordinates) {
      new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
    }
  };

  return <div className={style.wrapper} id='map' />;
};

export default Map;
