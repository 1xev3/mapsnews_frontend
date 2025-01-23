"use client"

// components/MapComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import api from '@/lib/api';
import { getUserLocation } from '@/lib/location_storage';

import "./MapComponent.css"
import NewsFilter from './NewsFilter';
import MarkerData, { SearchPoint } from "@/types/MarkerData";
import { NewsResponse } from "@/types/ApiTypes";


interface MapComponentProps {
  center: [number, number];
  zoom: number;
  onMarkerClick: (news_uid: string) => void;
  mapRef?: React.RefObject<any>;
}

const MapComponent: React.FC<MapComponentProps> = React.memo(({ center, zoom, onMarkerClick }) => {
  const savedLocation = getUserLocation();
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(
    savedLocation 
      ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude, radius: 10000 }
      : { latitude: center[0], longitude: center[1], radius: 10000 }
  );
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  ////////////////////
  // FETCH MARKERS //
  ///////////////////
  const fetchMarkers = async (latitude?: number, longitude?: number, radius?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (latitude && longitude && radius) {
        const response = await api.getPointsInRadius(latitude, longitude, radius);
        setMarkers(response.data);
        // Center map on search point
        if (map) {
          map.setView([latitude, longitude], zoom);
        }
      } else {
        setMarkers([]);
      }
    } catch (err) {
      setError('Ошибка при загрузке точек');
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
 
  ///////////////////
  // FILTER CHANGE //
  ///////////////////
  const handleFilterChange = async ({ radius, latitude, longitude }: {
    radius: number;
    latitude?: number;
    longitude?: number;
  }) => {
    if (latitude && longitude) {
      setSearchPoint({ latitude, longitude, radius });
    } else {
      setSearchPoint(null);
    }
  };

  //////////////////
  // MARKER CLICK //
  //////////////////
  const handleMarkerClick = async (markerId: string) => {
    try {
      const response = await api.getNewsByGeoIDs([markerId]);
      if (response.data && response.data.length > 0) {
        setSelectedNews(response.data[0]);
        console.log(response.data[0]);
      }
      onMarkerClick(markerId);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Ошибка при загрузке новости');
    }
  };

  // IF NOT SSR //
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  ////////////////
  // RENDER MAP //
  ////////////////
  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100vh', width: '100%' }}
        ref={setMap}
      >
        {/* Standard OSM map layer */}
        <TileLayer
          url="http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
          zIndex={1}
        />

        {isLoading && (
          <div className="absolute top-24 left-4 z-[1000] bg-white p-2 rounded shadow">
            Loading...
          </div>
        )}

        {error && (
          <div className="absolute top-24 left-4 z-[1000] bg-red-100 text-red-700 p-2 rounded shadow">
            {error}
          </div>
        )}

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

        {searchPoint && (
          <Circle
            center={[searchPoint.latitude, searchPoint.longitude]}
            radius={searchPoint.radius/1.6}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
        )}

        <NewsFilter onFilterChange={handleFilterChange} />
      </MapContainer>
    </div>
  );
});

export default MapComponent;
