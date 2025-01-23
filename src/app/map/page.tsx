'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { FaTh, FaLocationArrow } from "react-icons/fa";
import { getUserLocation, saveUserLocation } from '@/lib/location_storage';
import NewsFilter from '@/components/map/NewsFilter';
import MarkerData, { SearchPoint } from '@/types/MarkerData';
import api from '@/lib/api';

import { NewsResponse } from '@/types/ApiTypes';

const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), {ssr: false});

const Home: React.FC = () => {
  // Dynamic imports for Leaflet components

  const savedLocation = getUserLocation();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [center, setCenter] = useState([54.18753233082934, 35.17676568455171]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(
    savedLocation 
      ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude, radius: savedLocation.radius? savedLocation.radius : 10000 }
      : { latitude: center[0], longitude: center[1], radius: 10000 }
  );

  ////////////////////
  // FETCH MARKERS //
  ///////////////////
  const fetchMarkers = async (latitude?: number, longitude?: number, radius?: number) => {
    try {
      setIsLoading(true);
      
      if (latitude && longitude && radius) {
        const response = await api.getPointsInRadius(latitude, longitude, radius);
        setMarkers(response.data);
      } else {
        setMarkers([]);
      }
    } catch (err) {
      console.error('Error fetching markers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  ////////////////
  // USE EFFECT //
  ////////////////
  useEffect(() => {
    if (searchPoint) {
      fetchMarkers(searchPoint.latitude, searchPoint.longitude, searchPoint.radius);
    }
  }, [searchPoint]);

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
          // setSearchPoint({ latitude, longitude, radius: 10000 });
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

  const mapComponentRef = useRef<L.Map | null>(null);

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
      >
        <NewsFilter setSearchPoint={setSearchPoint} searchPoint={searchPoint} />

        {/* MARKERS */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(marker.id)
            }}
            zIndexOffset={1000}
          >
            <Popup>
              {selectedNews ? (
                <div className="text-teal-500">
                  <h3 className="font-bold">{selectedNews.title}</h3>
                  <p className="text-sm mt-1">{selectedNews.content}</p>
                  <p className="text-xs mt-2 text-gray-500">
                    {new Date(selectedNews.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  Loading...
                </div>
              )}
            </Popup>
          </Marker>
        ))}

      </MapWithNoSSR>
    ), 
    [center, markers, selectedNews, handleMarkerClick]
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
            className="bg-white text-black px-4 py-2 rounded hover:bg-emerald-300 transition-colors shadow-lg"
            onClick={handleGeolocation}
            title="Определить моё местоположение"
          >
            <FaLocationArrow/>
          </button>

          <button 
            className="sm:hidden bg-white text-black px-4 py-2 rounded hover:bg-emerald-300 transition-colors shadow-lg"
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
