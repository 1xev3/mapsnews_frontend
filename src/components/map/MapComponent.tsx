"use client"

// components/MapComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";

import "./MapComponent.css"

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  onMarkerClick: (news_uid: string) => void;
  mapRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

const MapComponent: React.FC<MapComponentProps> = React.memo(({ center, zoom, onMarkerClick, children }) => {

  
  const [map, setMap] = useState<L.Map | null>(null);

  // IF SSR //
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

        {/* LOADING */}
        {/* {isLoading && (
          <div className="absolute top-24 left-4 z-[1000] bg-white p-2 rounded shadow">
            Loading...
          </div>
        )} */}

        {children}

        {/* <NewsFilter onFilterChange={handleFilterChange} /> */}
      </MapContainer>
    </div>
  );
});

export default MapComponent;
