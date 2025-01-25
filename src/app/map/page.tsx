'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { FaLocationArrow, FaMapMarkerAlt } from "react-icons/fa";

import NewsSearchPoint from '@/components/map/NewsSearchPoint';
import Button from '@/components/ui/Button';
import NavBar from '@/components/map/NavBar';

import api from '@/lib/api';
import { getUserLocation, saveUserLocation } from '@/lib/location_storage';

import { NewsResponse } from '@/types/ApiTypes';
import MarkerData, { SearchPoint } from '@/types/MarkerData';
import NewsContainer from '@/components/news/NewsContainer';

const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), {ssr: false});



const Home: React.FC = () => {
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
    if (!latitude || !longitude || !radius) {
      setMarkers([]);
      return;
    }

    setIsLoading(true);
    
    api.getPointsInRadius(latitude, longitude, radius*1000).then((response) => {
      setMarkers(response.data);
    }).finally(() => {
      setIsLoading(false);
    }); // meters -> kilometers
  };

  ///////////////////////////
  // SEARCH NEWS IN RADIUS //
  ///////////////////////////
  // useEffect(() => {
  //   if (searchPoint) {
  //     fetchMarkers(searchPoint.latitude, searchPoint.longitude, searchPoint.radius);
  //   }
  // }, [searchPoint]);

  const handleMarkerClick = (geo_id: string) => {
    api.getNewsByGeoIDs([geo_id]).then((response) => {
      if (response.data.length > 0) {
        console.log('response.data', response.data);
        setSelectedNews(response.data[0]);
      } else {
        setSelectedNews(null);
      }
    }).catch((error) => {
      console.error('Error fetching news:', error);
    });
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
          console.log("Ошибка получения геолокации:", error);
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
        mapType="m"
      >
        <NewsSearchPoint setSearchPoint={setSearchPoint} searchPoint={searchPoint} showFiltersMenu={showFilters} />

        {/* MARKERS */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(marker.id)
            }}
            zIndexOffset={1000}
            riseOnHover={true}
          >
            <Popup>
              {selectedNews ? (
                <div className="text-teal-500">
                  <h3 className="font-bold text-xl">{selectedNews.title}</h3>
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
    <div className="flex flex-col h-screen">

      {/* NAVBAR */}
      <NavBar />

      {/* MAP */}
      <div className={`flex-1 flex flex-col sm:flex-row pt-14`}> 
        <div className={`relative w-full ${selectedNews ? 'h-3/4' : 'h-full'} sm:h-full min-h-96`}>
          <div className="w-full h-full">
            {displayMap}
          </div>

          {/* RIGHT BUTTONS */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 rounded-lg p-2">
            <Button 
              className="px-2 py-2 rounded-full"
              onClick={handleGeolocation}
              title="Определить моё местоположение"
            >
              <FaLocationArrow/>
            </Button>

            <Button 
              className="px-2 py-2 rounded-full"
              onClick={() => setShowFilters(!showFilters)}
              title="Радиус поиска"
            >
              <FaMapMarkerAlt />
            </Button>
          </div>
        </div>

        {/* SIDEBAR */}
        {selectedNews && (
          <NewsContainer className='w-full sm:min-w-96 sm:w-96 lg:w-1/4 p-4 bg-white sm:h-[calc(100vh-3.5rem)] overflow-visible sm:overflow-y-auto break-words' news={selectedNews} />
        )}
      </div>
    </div>
  );
};

export default Home;
