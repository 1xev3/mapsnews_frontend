// components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

import './MapComponent.css'

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
}

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, markers }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
      //attributionControl={false}
    >
      {/* Подключаем стандартный слой карт OSM */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.lat, marker.lng]}
          // icon={new L.Icon({ iconUrl: '/marker-icon.png', iconSize: [25, 41] })}
        >
          <Popup> {marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
