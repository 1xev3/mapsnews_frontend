import React, { useState, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import Card from '../ui/Card';
import { saveUserLocation, getUserLocation } from '@/lib/location_storage';
import { SearchPoint } from '@/types/MarkerData';
import dynamic from "next/dynamic";
const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), {ssr: false});

interface NewsFilterProps {
  setSearchPoint: (point: SearchPoint | null) => void;
  searchPoint: SearchPoint | null;
}

const NewsFilter: React.FC<NewsFilterProps> = ({ setSearchPoint, searchPoint }) => {

  
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isSelectingPoint) {
          setSearchPoint({ latitude: e.latlng.lat, longitude: e.latlng.lng, radius: searchPoint?.radius || 10000 });
          saveUserLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng, radius: searchPoint?.radius || 10000 });
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
          <Circle
            center={[searchPoint.latitude, searchPoint.longitude]}
            radius={searchPoint.radius/1.6}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
        )}
        
      <div 
        className="absolute top-20 right-4 z-[1000] hidden sm:block"
        onClick={handleCardClick}
      >
        <Card className="w-72">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Фильтры новостей</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Радиус поиска (метры)
              </label>
              <input
                type="number"
                value={searchPoint?.radius || 10000}
                onChange={handleRadiusChange}
                className="w-full p-1 border-solid border-2 border-emerald-400 rounded-md"
                onClick={e => e.stopPropagation()}
              />
              <span className="text-sm text-gray-500">{searchPoint?.radius || 10000} м</span>
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

            <div className="flex space-x-2">
              <button
                onClick={handleSelectPoint}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isSelectingPoint
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isSelectingPoint ? 'Выберите точку на карте' : 'Указать точку'}
              </button>
              
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
              >
                Сбросить
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default NewsFilter; 