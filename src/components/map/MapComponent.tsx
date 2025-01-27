"use client"

// components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";

import "./MapComponent.css"

{/* For anyone who wants to save some time while looking for specific tile types:
  h = roads only
  m = standard roadmap
  p = terrain
  r = somehow altered roadmap
  s = satellite only
  t = terrain only
  y = hybrid 
*/}
interface MapComponentProps {
  center: [number, number];
  zoom: number;
  mapRef?: React.RefObject<any>;
  mapType: "h" | "m" | "p" | "r" | "s" | "t" | "y";
  children?: React.ReactNode;
  onMoveEnd?: () => void;
}

// Event handler component
const MapEventHandler: React.FC<{ onMoveEnd?: () => void }> = ({ onMoveEnd }) => {
  useMapEvents({
    moveend: () => {
      if (onMoveEnd) {
        onMoveEnd();
      }
    },
  });
  return null;
};

const MapComponent: React.FC<MapComponentProps> = React.memo(({ center, zoom, mapRef, children, mapType = "m", onMoveEnd }) => {
  // const [map, setMap] = useState<L.Map | null>(null);

  // IF SSR //
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  ////////////////
  // RENDER MAP //
  ////////////////
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      ref={mapRef}
    >
      {/* Event Handler */}
      <MapEventHandler onMoveEnd={onMoveEnd} />

      {/* Google OSM map layer */}
      <TileLayer
        url={`http://{s}.google.com/vt?lyrs=${mapType}&x={x}&y={y}&z={z}`}
        subdomains={['mt0','mt1','mt2','mt3']}
        zIndex={1}
      />

      {/* 2GIS map layer */}
      {/* <TileLayer
        url={`http://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}`}
        zIndex={1}
      /> */}


      {children}

    </MapContainer>
  );
});

export default MapComponent;
