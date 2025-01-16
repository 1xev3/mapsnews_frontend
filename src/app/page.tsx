"use client"

// pages/index.tsx
import React, { useState } from 'react';
import dynamic from "next/dynamic";

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
  date: string;
}

const Home: React.FC = () => {
  const [filter, setFilter] = useState({ distance: 10, time: 'last24' });

  const MapWithNoSSR = dynamic(() => import("../components/MapComponent"), {
    ssr: false
  });

  const markers: MarkerData[] = [
    { lat: 51.505, lng: -0.09, title: 'News 1', date: '2025-01-15' },
    { lat: 51.515, lng: -0.1, title: 'News 2', date: '2025-01-10' },
  ];

  // const filteredMarkers = markers.filter((marker) => {
  //   const currentDate = new Date();
  //   const markerDate = new Date(marker.date);
  //   const timeDiff = (currentDate.getTime() - markerDate.getTime()) / (1000 * 3600 * 24); // в днях
  //   return timeDiff <= 1 && filter.distance <= 10; // Пример фильтрации
  // });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow">
        <MapWithNoSSR center={[51.505, -0.09]} zoom={13} markers={markers} />
      </div>
    </div>
  );
};

export default Home;
