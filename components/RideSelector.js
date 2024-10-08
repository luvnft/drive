import Image from 'next/image';
import { useEffect, useContext, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { UberContext } from '../context/uberContext';
import ethLogo from '../assets/eth-logo.png';

const style = {
  wrapper: `h-full flex flex-col`,
  title: `text-gray-500 text-center text-xs py-2 border-b`,
  carList: `flex flex-col flex-1 overflow-auto scrollbar-hide`,
  car: `flex p-3 m-2 items-center border-2 border-white`,
  selectedCar: `border-2 border-black flex p-3 m-2 items-center`,
  carImage: `h-14`,
  carDetails: `ml-2 flex-1`,
  service: `font-medium`,
  time: `text-xs text-blue-500`,
  priceContainer: `flex items-center`,
  price: `mr-[-0.8rem]`,
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const RideSelector = () => {
  const [carList, setCarList] = useState([]);
  const { selectedRide, setSelectedRide, setPrice, basePrice, pickupCoordinates, dropoffCoordinates } =
    useContext(UberContext);
  const [distance, setDistance] = useState(null);

  console.log(basePrice);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/db/getRideTypes');
        const data = await response.json();
        setCarList(data.data);
        setSelectedRide(data.data[0]);
      } catch (error) {
        console.error("Failed to fetch ride types:", error);
      }
    })();
  }, [setSelectedRide]);

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("Mapbox access token is missing. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.");
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error("Map container element not found.");
      return;
    }

    // Clear previous content
    mapContainer.innerHTML = '';

    if (pickupCoordinates && dropoffCoordinates) {
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/atl5d/cm0kb0y3u023x01qrfehze7qx',
        center: [-74.3419, 39.6032],
        zoom: 12,
      });

      const addToMap = (map, coordinates) => {
        if (coordinates) {
          new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
        }
      };

      addToMap(map, pickupCoordinates);
      addToMap(map, dropoffCoordinates);

      const calculateDistance = () => {
        if (pickupCoordinates && dropoffCoordinates) {
          const distance = turf.distance(
            turf.point(pickupCoordinates),
            turf.point(dropoffCoordinates)
          );
          console.log('Distance:', distance);
          setDistance(distance);
          map.fitBounds([dropoffCoordinates, pickupCoordinates], {
            padding: 400,
          });
        }
      };

      calculateDistance();

      // Cleanup on unmount
      return () => {
        if (map) map.remove();
      };
    }
  }, [pickupCoordinates, dropoffCoordinates]);

  return (
    <div className={style.wrapper}>
      <div className={style.title}>Choose a ride, or swipe up for more</div>
      <div className={style.carList}>
        {carList.map((car, index) => (
          <div
            key={index}
            className={`${
              selectedRide.service === car.service
                ? style.selectedCar
                : style.car
            }`}
            onClick={() => {
              setSelectedRide(car);
              setPrice(((basePrice / 10 ** 5) * car.priceMultiplier).toFixed(5));
            }}
          >
            <Image
              src={car.iconUrl}
              className={style.carImage}
              height={50}
              width={50}
              alt="carImage"
            />
            <div className={style.carDetails}>
              <div className={style.service}>{car.service}</div>
              <div className={style.time}>5 min away</div>
            </div>
            <div className={style.priceContainer}>
              <div className={style.price}>
                {((basePrice / 10 ** 5) * car.priceMultiplier).toFixed(5)}
              </div>
              <Image src={ethLogo} height={25} width={40} alt='ethLogo' />
            </div>
            <div className={style.priceContainer}>
              <div className={style.price} id='map'>
                {distance ? `${distance.toFixed(1)} km` : "Distance not available"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideSelector;
