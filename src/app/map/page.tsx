'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { FaTh, FaLocationArrow, FaFilter } from "react-icons/fa";

import NewsFilter from '@/components/map/NewsFilter';
import Button from '@/components/ui/Button';

import api from '@/lib/api';
import { getUserLocation, saveUserLocation } from '@/lib/location_storage';

import { NewsResponse } from '@/types/ApiTypes';
import MarkerData, { SearchPoint } from '@/types/MarkerData';
import { twMerge } from 'tailwind-merge';

const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), {ssr: false});

const Home: React.FC = () => {
  // Dynamic imports for Leaflet components

  const savedLocation = getUserLocation();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [center, setCenter] = useState([54.18753233082934, 35.17676568455171]);
  const [isLoading, setIsLoading] = useState(false);

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(
    savedLocation 
      ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude, radius: savedLocation.radius? savedLocation.radius : 100 }
      : { latitude: center[0], longitude: center[1], radius: 100 }
  );

  ////////////////////
  // FETCH MARKERS //
  ///////////////////
  const fetchMarkers = async (latitude?: number, longitude?: number, radius?: number) => {
    try {
      setIsLoading(true);
      
      if (latitude && longitude && radius) {
        const response = await api.getPointsInRadius(latitude, longitude, radius*1000); // meters -> kilometers
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

  ///////////////////////////
  // SEARCH NEWS IN RADIUS //
  ///////////////////////////
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
          saveUserLocation({ latitude, longitude, radius: 100 });
          setSearchPoint({ latitude, longitude, radius: 100 });
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

  // Add new function to calculate zoom level based on radius
  const calculateZoomLevel = (radiusInKm: number): number => {
    // Approximate zoom levels for different radiuses
    if (radiusInKm <= 1) return 15;      // ~1km
    if (radiusInKm <= 2) return 14;      // ~2km
    if (radiusInKm <= 5) return 13;      // ~5km
    if (radiusInKm <= 10) return 12;     // ~10km
    if (radiusInKm <= 20) return 11;     // ~20km
    if (radiusInKm <= 50) return 10;     // ~50km
    if (radiusInKm <= 100) return 9;     // ~100km
    return 8;                            // >100km
  };

  //////////////////
  // MEMOIZED MAP //
  //////////////////
  const displayMap = useMemo(
    () => (
      <MapWithNoSSR
        mapRef={mapComponentRef}
        center={center as [number, number]} 
        zoom={searchPoint ? calculateZoomLevel(searchPoint.radius) : 14}
        onMarkerClick={handleMarkerClick} 
      >
        <NewsFilter setSearchPoint={setSearchPoint} searchPoint={searchPoint} showFiltersMenu={showFilters} />

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
    [center, markers, selectedNews, handleMarkerClick, searchPoint?.radius]
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

      {/* SIDE PANEL */}
      <div className={twMerge(
        "flex flex-row sm:flex-col w-full sm:w-16 bg-gray-100 shadow-lg p-4 border-l z-20",
        showSidePanel && "h-full absolute sm:static sm:w-48"
      )}>
        <div className="flex flex-row sm:flex-col w-full sm:h-full justify-between items-center h-8">
          <h2 className="text-xl font-bold text-zinc-800">NM</h2>

          <Button 
            className={twMerge(
              "px-2 py-2",
              showSidePanel && "bg-transparent hover:bg-transparent hover:text-emerald-500 text-zinc-800 rounded-full py-2 w-auto sm:w-full"
            )}
            onClick={() => setShowSidePanel(!showSidePanel)}
            title="Показать/скрыть меню"
          >
            <FaTh/>
            <span className={`hidden ${showSidePanel? 'sm:block' : ''}`}>
              {showSidePanel ? 'Скрыть' : ''}
            </span>
          </Button>
        </div>
      </div>

      {/* MAP */}
      <div className={`relative w-full h-32 sm:h-auto sm:flex-1`}> 
        <div>
          {displayMap}
        </div>

        {/* RIGHT BUTTONS */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 rounded-lg p-2">
          <Button 
            className="px-2 py-2"
            onClick={handleGeolocation}
            title="Определить моё местоположение"
          >
            <FaLocationArrow/>
          </Button>

          <Button 
            className="px-2 py-2"
            onClick={() => setShowFilters(!showFilters)}
            title="Показать/скрыть фильтры"
          >
            <FaFilter/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
