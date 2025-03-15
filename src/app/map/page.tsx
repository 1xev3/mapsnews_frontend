'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';

import NewsSearchPoint from '@/components/map/NewsSearchPoint';
import NavBar from '@/components/map/NavBar';
import MapControls from '@/components/map/mapControls';
import NewsContainer from '@/components/news/NewsContainer';

import api from '@/lib/api';
import { getUserLocation } from '@/lib/news_data_storage';
import { debounce } from '@/components/map/mapUtils';

import { NewsResponse } from '@/types/ApiTypes';
import { MarkerDataWithTitle, SearchPoint } from '@/types/MarkerData';

const MapWithNoSSR = dynamic(() => import("@/components/map/MapComponent"), {ssr: false});
const MapMarkers = dynamic(() => import("@/components/map/mapMarkers"), {ssr: false});

// Custom hook for URL params handling
const useUrlParams = () => {
  const searchParams = useSearchParams();
  return {
    urlLat: searchParams.get('lat'),
    urlLng: searchParams.get('lng'),
    urlZoom: searchParams.get('zoom'),
  };
};

// Custom hook for markers fetching
const useMarkersFetching = (timeFilter: number | null, selectedTags: string[]) => {
  const [markers, setMarkers] = useState<MarkerDataWithTitle[]>([]);

  const fetchMarkers = async (latitude?: number, longitude?: number, radius?: number) => {
    if (!latitude || !longitude || !radius) {
      setMarkers([]);
      return;
    }

    const startDate: Date | null = timeFilter ? new Date(Date.now() - timeFilter * 60 * 60 * 1000) : null;
    const endDate: Date | null = timeFilter ? new Date() : null;

    try {
      const response = await api.getNewsInRadius(
        latitude, 
        longitude, 
        radius*1000, 
        startDate, 
        endDate,
        selectedTags.length > 0 ? selectedTags : undefined
      );
      setMarkers(response.data.map((news) => ({
        id: news.id.toString(),
        longitude: news.longitude,
        latitude: news.latitude,
        title: news.title,
      })));
    } catch (error) {
      toast.error('Ошибка получения маркеров');
      console.log('Error fetching markers:', error);
    }
  };

  return { markers, fetchMarkers };
};

const Home: React.FC = () => {
  // URL and location state
  const { urlLat, urlLng, urlZoom } = useUrlParams();
  const savedLocation = getUserLocation();
  const [center, setCenter] = useState(
    urlLat && urlLng 
      ? [parseFloat(urlLat), parseFloat(urlLng)]
      : [savedLocation?.latitude || 54.18753233082934, savedLocation?.longitude || 35.17676568455171]
  );
  const [zoom, setZoom] = useState(urlZoom ? parseInt(urlZoom) : 14);

  // UI state
  const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean>(false);
  const [showSearchPointMenu, setShowSearchPointMenu] = useState(false);
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  // Data state
  const [timeFilter, setTimeFilter] = useState<number | null>(720);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { markers, fetchMarkers } = useMarkersFetching(timeFilter, selectedTags);
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(
    savedLocation 
      ? { 
          latitude: savedLocation.latitude, 
          longitude: savedLocation.longitude, 
          radius: savedLocation.radius ?? 100 
        }
      : { latitude: center[0], longitude: center[1], radius: 100 }
  );

  // Refs
  const mapComponentRef = useRef<L.Map | null>(null);

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

  useEffect(() => {
    if (searchPoint) {
      fetchMarkers(searchPoint.latitude, searchPoint.longitude, searchPoint.radius);
    }
  }, [searchPoint, timeFilter, selectedTags]);

  const getCenter = () => {
    return mapComponentRef.current?.getCenter();
  };

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

  const handleMapMove = useCallback(
    debounce(() => {
      const map = mapComponentRef.current;
      if (map) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setShouldShowTooltip(zoom >= 14);
        const newUrl = `/map?lat=${center.lat.toFixed(6)}&lng=${center.lng.toFixed(6)}&zoom=${zoom}`;
        window.history.replaceState({}, '', newUrl);
      }
    }, 300), 
    []
  );

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
        <MapMarkers 
          markers={markers}
          selectedNews={selectedNews}
          shouldShowTooltip={shouldShowTooltip}
          onMarkerClick={handleMarkerClick}
        />
      </MapWithNoSSR>
    ),
    [center, markers, selectedNews, handleMapMove, shouldShowTooltip, showSearchPointMenu]
  );

  const handleTimeFilterChange = (hours: number) => {
    setTimeFilter(hours);
    console.log(`Filtering news for last ${hours} hours`);
  };

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer position="bottom-left" autoClose={2000} theme="dark" />
      <NavBar />
      
      <div className={`flex-1 flex flex-col md:flex-row pt-14`}> 
        <div className={`relative w-full ${selectedNews ? 'h-3/4' : 'h-full'} md:h-full min-h-96`}>
          <div className="w-full h-full">
            {displayMap}
          </div>
          
          <MapControls 
            onCreateNewsClick={handleCreateNewsClick}
            showSearchPointMenu={showSearchPointMenu}
            setShowSearchPointMenu={setShowSearchPointMenu}
            showFiltersMenu={showFiltersMenu}
            setShowFiltersMenu={setShowFiltersMenu}
            onTimeFilterChange={handleTimeFilterChange}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

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
