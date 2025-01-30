'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { FaFilter, FaMapMarkerAlt, FaPlus } from "react-icons/fa";

import NewsSearchPoint from '@/components/map/NewsSearchPoint';
import Button from '@/components/ui/Button';
import NavBar from '@/components/map/NavBar';
import FiltersMenu from '@/components/map/FiltersMenu';

import api from '@/lib/api';
import { getUserLocation, saveUserLocation } from '@/lib/news_data_storage';

import { NewsResponse } from '@/types/ApiTypes';
import MarkerData, { MarkerDataWithTitle, SearchPoint } from '@/types/MarkerData';
import NewsContainer from '@/components/news/NewsContainer';

import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';

const MapWithNoSSR = dynamic(() => import("../../components/map/MapComponent"), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), {ssr: false});
const Tooltip = dynamic(() => import("react-leaflet").then(mod => mod.Tooltip), {ssr: false});

// Debounce helper function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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

///////////////
// COMPONENT //
///////////////
const Home: React.FC = () => {
  const savedLocation = getUserLocation();

  const searchParams = useSearchParams();
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const urlZoom = searchParams.get('zoom');

  const [markers, setMarkers] = useState<MarkerDataWithTitle[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [timeFilter, setTimeFilter] = useState<number | null>(null);
  const [center, setCenter] = useState(
    urlLat && urlLng 
      ? [parseFloat(urlLat), parseFloat(urlLng)]

      : [savedLocation?.latitude || 54.18753233082934, savedLocation?.longitude || 35.17676568455171]
  );
  const [zoom, setZoom] = useState(urlZoom ? parseInt(urlZoom) : 14);
  const [showSearchPointMenu, setShowSearchPointMenu] = useState(false);
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(
    savedLocation 
      ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude, radius: savedLocation.radius? savedLocation.radius : 100 }
      : { latitude: center[0], longitude: center[1], radius: 100 }
  );
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  ////////////////////
  // FETCH MARKERS //
  ///////////////////
  const fetchMarkers = async (latitude?: number, longitude?: number, radius?: number) => {
    if (!latitude || !longitude || !radius) {
      setMarkers([]);
      return;
    }

    const startDate: Date | null = timeFilter ? new Date(Date.now() - timeFilter * 60 * 60 * 1000) : null;
    const endDate: Date | null = timeFilter ? new Date() : null;

    api.getNewsInRadius(
      latitude, 
      longitude, 
      radius*1000, 
      startDate,
      endDate
    ).then((response) => {
      setMarkers(response.data.map((news) => ({
        id: news.id.toString(),
        longitude: news.longitude,
        latitude: news.latitude,
        title: news.title,
      })));
    }).catch((error) => {
      toast.error('Ошибка получения маркеров');
      console.log('Error fetching markers:', error);
    });

  };

  /////////////////////////
  // HANDLE MARKER CLICK //
  /////////////////////////
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

  ///////////////////////////
  // SEARCH NEWS IN RADIUS //
  ///////////////////////////
  useEffect(() => {
    if (searchPoint) {
      fetchMarkers(searchPoint.latitude, searchPoint.longitude, searchPoint.radius);
    }
  }, [searchPoint, timeFilter]);


  //////////////
  // HANDLERS //
  //////////////
  const getCenter = () => {
    return mapComponentRef.current?.getCenter();
  }

  const handleCreateNewsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentCenter = getCenter();
    if (currentCenter) {
      window.location.href = `/news/create?lat=${currentCenter.lat.toFixed(6)}&lng=${currentCenter.lng.toFixed(6)}`;
    }
  };

  const handleGeoPointClick = (latitude: number, longitude: number) => {
    setZoom(14);
    setCenter([latitude, longitude]);
  };

  const handleMapMove = useCallback(debounce(() => {
    const map = mapComponentRef.current;
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const newUrl = `/map?lat=${center.lat.toFixed(6)}&lng=${center.lng.toFixed(6)}&zoom=${zoom}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, 300), []); // 300ms delay


  // Update map view when center or zoom changes
  useEffect(() => {
    mapComponentRef.current?.setView(center as [number, number], zoom ? zoom : calculateZoomLevel(searchPoint?.radius || 100));
  }, [center, zoom]);


  //////////////////
  // MEMOIZED MAP //
  //////////////////
  const mapComponentRef = useRef<L.Map | null>(null);

  const shouldShowTooltip = () => {
    if (!mapComponentRef.current) return false;
    const map = mapComponentRef.current;
    return map.getZoom() >= 15;
  };
  const displayMap = useMemo(
    () => (
      <MapWithNoSSR
        mapRef={mapComponentRef}
        center={center as [number, number]} 
        zoom={zoom}
        mapType="m"
        onMoveEnd={handleMapMove}
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
            title={selectedNews?.title || ''}
          >
            <Popup> 
              {selectedNews && 
                <div className="break-words">
                  <h3 className="text-teal-500 font-bold text-md">{selectedNews.title}</h3>
                  <p className="text-xs mt-2 text-gray-500">
                    {new Date(selectedNews.created_at).toLocaleDateString()}
                  </p>
                </div>
              }
            </Popup>
            {shouldShowTooltip() && (
              <Tooltip 
                permanent={true} 
                direction="bottom" 
                offset={[-16, 20]}
                className="custom-tooltip"
              >
                <span className="truncate block">
                  {marker.title}
                </span>
              </Tooltip>
            )}
          </Marker>
        ))}

      </MapWithNoSSR>
    ), 
    [center, markers, selectedNews, handleMarkerClick, searchPoint?.radius, zoom]
  );

  const handleTimeFilterChange = (hours: number) => {
    // Here you can implement the logic to filter news by time
    setTimeFilter(hours);
    console.log(`Filtering news for last ${hours} hours`);
    // You might want to add timeFilter to your API call parameters
  };

  // render
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
      <div className={`flex-1 flex flex-col md:flex-row pt-14`}> 
        <div className={`relative w-full ${selectedNews ? 'h-3/4' : 'h-full'} md:h-full min-h-96`}>
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
              <span className="text-xs hidden md:block">Создать новость</span>
            </Link>

            {/* SEARCH POINT BUTTON */}
            <Button 
              className="w-fit px-3 py-2 rounded-full"
              onClick={() => setShowSearchPointMenu(!showSearchPointMenu)}
              title="Радиус поиска"
            >
              <FaMapMarkerAlt />
              <span className="text-xs hidden md:block">Точка поиска</span>
            </Button>

            {/* FILTERS BUTTON */}
            <div className="flex items-center gap-1">
              <Button 
                className="w-fit px-3 py-2 rounded-full"
                onClick={() => setShowFiltersMenu(!showFiltersMenu)}
                title="Фильтры"
              >
                <FaFilter />
                <span className="text-xs hidden md:block">Фильтры</span>
              </Button>
              <FiltersMenu
                isOpened={showFiltersMenu}
                setIsOpened={setShowFiltersMenu}
                onTimeFilterChange={handleTimeFilterChange}
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        {selectedNews && (
          <NewsContainer 
            className='w-full md:min-w-120 md:w-120 lg:w-1/4 p-4 bg-white md:h-[calc(100vh-3.5rem)] overflow-visible md:overflow-y-auto break-words' 
            news={selectedNews}
            onGeoPointClick={handleGeoPointClick}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
