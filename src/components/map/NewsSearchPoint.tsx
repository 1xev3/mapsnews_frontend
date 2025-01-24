import React, { useState } from 'react';
import dynamic from "next/dynamic";

import { useMapEvents } from 'react-leaflet';
import { saveUserLocation, getUserLocation } from '@/lib/location_storage';
import { SearchPoint } from '@/types/MarkerData';
const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});

import { FaMapMarkerAlt } from 'react-icons/fa';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface NewsSearchPointProps {
  setSearchPoint: (point: SearchPoint | null) => void;
  searchPoint: SearchPoint | null;
  showFiltersMenu: boolean;
}

const NewsSearchPoint: React.FC<NewsSearchPointProps> = ({ setSearchPoint, searchPoint, showFiltersMenu }) => {
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isSelectingPoint) {
          setSearchPoint({ latitude: e.latlng.lat, longitude: e.latlng.lng, radius: searchPoint?.radius || 1 });
          saveUserLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng, radius: searchPoint?.radius || 1 });
          setIsSelectingPoint(false);
        }
      },
    });
    return null;
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = Number(e.target.value);
    if (searchPoint) {
      setSearchPoint({ ...searchPoint, radius: newRadius });
      saveUserLocation({ latitude: searchPoint.latitude, longitude: searchPoint.longitude, radius: newRadius });
    }
  };

  const handleSelectPoint = () => {
    setIsSelectingPoint(true);
  };

  const handleClearFilters = () => {
    setSearchPoint(null);
    setIsSelectingPoint(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <MapClickHandler />

      {/* CIRCLE */}
      {searchPoint && (
        <>
          <Circle
            center={[searchPoint.latitude, searchPoint.longitude]}
            radius={searchPoint.radius/1.6 * 1000} // meters -> kilometers
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.02 }}
            interactive={false}
          />
          {/* <Marker
            position={[searchPoint.latitude, searchPoint.longitude]}
          /> */}
          <Circle
            center={[searchPoint.latitude, searchPoint.longitude]}
            radius={20} // meters -> kilometers
            pathOptions={{ color: 'blue', fillColor: 'transparent', fillOpacity: 0.1 }}
            interactive={false}
          />
        </>
      )}
        
      <div 
        className="absolute left-4 bottom-4 z-[1000]"
        onClick={handleCardClick}
      >
        {showFiltersMenu && <Card className="w-72">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Радиус поиска (киллометры)
              </label>
              <input
                type="number"
                value={searchPoint?.radius || 1}
                onChange={handleRadiusChange}
                className="w-full p-1 border-solid border-2 border-emerald-400 rounded-md"
                onClick={e => e.stopPropagation()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Точка поиска
              </label>
              {searchPoint ? (
                <div className="text-sm text-gray-500">
                  {searchPoint.latitude.toFixed(6)}, {searchPoint.longitude.toFixed(6)}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Точка не выбрана</div>
              )}
            </div>

            <div className="flex space-x-2 justify-center">
              <Button
                onClick={handleSelectPoint}
                className={`bg-zinc-900 rounded-full ${
                  isSelectingPoint
                    ? 'bg-emerald-600 hover:bg-emerald-400 text-white'
                    : 'bg-blue-600 hover:bg-blue-400 text-white'
                }`}
              >
                <FaMapMarkerAlt />
                {isSelectingPoint ? 'Кликните на карту' : 'Указать точку'}
              </Button>
              
              <Button
                onClick={handleClearFilters}
                className="text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                Сбросить
              </Button>
            </div>
          </div>
        </Card>}
      </div>
    </>
  );
};

export default NewsSearchPoint; 