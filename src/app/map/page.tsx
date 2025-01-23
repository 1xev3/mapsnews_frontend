"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { FaTh, FaLocationArrow } from "react-icons/fa";
import { getUserLocation, saveUserLocation } from '@/lib/location_storage';

const Home: React.FC = () => {
  const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {
    ssr: false
  });

  const [showSidePanel, setShowSidePanel] = useState(true);
  const [center, setCenter] = useState([54.18753233082934, 35.17676568455171]);

  const handleMarkerClick = (news_uid: string) => {
    console.log('Clicked news:', news_uid);
  };

  /////////////////////
  // GEOLOCATION GET //
  /////////////////////
  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          
          saveUserLocation({ latitude, longitude, radius: 10000 });
          
          if (mapComponentRef.current) {
            mapComponentRef.current.handleFilterChange({
              radius: 10000, // дефолтный радиус
              latitude,
              longitude
            });
          }
        },
        (error) => {
          console.error("Ошибка получения геолокации:", error);
          alert("Не удалось определить ваше местоположение");
        }
      );
    } else {
      alert("Геолокация не поддерживается вашим браузером");
    }
  };

  const mapComponentRef = useRef<any>(null);

  //////////////////
  // MEMOIZED MAP //
  //////////////////
  const displayMap = useMemo(
    () => (
      <MapWithNoSSR
        mapRef={mapComponentRef}
        center={center as [number, number]} 
        zoom={14}
        onMarkerClick={handleMarkerClick} 
      />
    ), 
    [center]
  );

  useEffect(() => {
    const savedLocation = getUserLocation();
    if (savedLocation) {
      setCenter([savedLocation.latitude, savedLocation.longitude]);
    } else {
      handleGeolocation();
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className={`${showSidePanel ? 'hidden sm:block' : 'block'} w-full h-full sm:w-16 bg-gray-100 shadow-lg p-4 border-l z-10`}>
        <h2 className="text-xl font-bold mb-4">NM</h2>
      </div>

      <div className={`relative w-full h-32 sm:h-auto sm:flex-1 transition-all`}> 
        <div>
          {displayMap}
        </div>

        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button 
            className="bg-white text-black px-4 py-2 rounded hover:bg-emerald-300 transition-colors"
            onClick={handleGeolocation}
            title="Определить моё местоположение"
          >
            <FaLocationArrow/>
          </button>

          <button 
            className="sm:hidden bg-white text-black px-4 py-2 rounded hover:bg-emerald-300 transition-colors"
            onClick={() => setShowSidePanel(!showSidePanel)}
            title="Показать/скрыть меню"
          >
            <FaTh/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
