'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { FaFilter, FaMapMarkerAlt, FaPlus } from "react-icons/fa";

import NewsSearchPoint from '@/components/map/NewsSearchPoint';
import Button from '@/components/ui/Button';
import NavBar from '@/components/map/NavBar';

import api from '@/lib/api';
import { getUserLocation, saveUserLocation } from '@/lib/location_storage';

import { NewsResponse } from '@/types/ApiTypes';
import MarkerData, { SearchPoint } from '@/types/MarkerData';
import NewsContainer from '@/components/news/NewsContainer';

import { toast, ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
Modal.setAppElement('#root');
import Link from 'next/link';

const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), {ssr: false});



const Home: React.FC = () => {
  const savedLocation = getUserLocation();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [center, setCenter] = useState([54.18753233082934, 35.17676568455171]);
  const [showSearchPointMenu, setShowSearchPointMenu] = useState(false);
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
    
    api.getPointsInRadius(latitude, longitude, radius*1000).then((response) => {
      setMarkers(response.data);
    }).catch((error) => {
      toast.error('Ошибка получения маркеров');
      console.log('Error fetching markers:', error);
    });
  };

  ///////////////////////////
  // SEARCH NEWS IN RADIUS //
  ///////////////////////////
  useEffect(() => {
    if (searchPoint) {
      fetchMarkers(searchPoint.latitude, searchPoint.longitude, searchPoint.radius);
    }
  }, [searchPoint]);

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
      toast.error('Ошибка получения новостей');
    });
  };

  /////////////////////
  // GEOLOCATION GET //
  /////////////////////
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
        mapType="m"
      >
        <NewsSearchPoint 
          setSearchPoint={setSearchPoint} 
          searchPoint={searchPoint} 
          showPointMenu={showSearchPointMenu} 
          setShowPointMenu={setShowSearchPointMenu} 
        />

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
                <div className="break-words">
                  <h3 className="text-teal-500 font-bold text-md">{selectedNews.title}</h3>
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

  const getCenter = () => {
    console.log('mapComponentRef.current?.getCenter()', mapComponentRef.current?.getCenter());
    return mapComponentRef.current?.getCenter();
  }

  const handleCreateNewsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentCenter = getCenter();
    if (currentCenter) {
      window.location.href = `/news/create?lat=${currentCenter.lat}&lng=${currentCenter.lng}`;
    }
  };

  useEffect(() => {
    const savedLocation = getUserLocation();
    if (savedLocation) {
      setCenter([savedLocation.latitude, savedLocation.longitude]);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">

      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        theme="dark"
      />

      {/* NAVBAR */}
      <NavBar />

      {/* MAP */}
      <div className={`flex-1 flex flex-col sm:flex-row pt-14`}> 
        <div className={`relative w-full ${selectedNews ? 'h-3/4' : 'h-full'} sm:h-full min-h-96`}>
          <div className="w-full h-full">
            {displayMap}
          </div>

          {/* RIGHT BUTTONS */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 rounded-lg p-2 items-end">
            {/* CREATE NEWS BUTTON */}
            <Link 
              className="w-fit px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex flex-row items-center justify-center gap-2"
              href={`/news/create`}
              onClick={handleCreateNewsClick}
            >
              <FaPlus />
              <span className="text-xs hidden sm:block">Создать новость</span>
            </Link>

            {/* SEARCH POINT BUTTON */}
            <Button 
              className="w-fit px-3 py-2 rounded-full"
              onClick={() => setShowSearchPointMenu(!showSearchPointMenu)}
              title="Радиус поиска"
            >
              <FaMapMarkerAlt />
              <span className="text-xs hidden sm:block">Точка поиска</span>
            </Button>

            {/* FILTERS BUTTON */}
            <Button 
              className="w-fit px-3 py-2 rounded-full"
              title="Радиус поиска"
            >
              <FaFilter />
              <span className="text-xs hidden sm:block">Фильтры</span>
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
