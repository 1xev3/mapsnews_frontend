import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";

import { useMapEvents } from 'react-leaflet';
import { saveUserLocation, getUserLocation } from '@/lib/news_data_storage';
import { SearchPoint } from '@/types/MarkerData';
const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), {ssr: false});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});

import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

interface NewsSearchPointProps {
  setSearchPoint: (point: SearchPoint | null) => void;
  searchPoint: SearchPoint | null;
  showPointMenu: boolean;
  setShowPointMenu: (show: boolean) => void;
}

const ButtonStyle = 'text-black rounded-full border-2 bg-white border-gray-600 hover:bg-gray-200';

const NewsSearchPoint: React.FC<NewsSearchPointProps> = ({ setSearchPoint, searchPoint, showPointMenu, setShowPointMenu }) => {
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

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          saveUserLocation({ latitude, longitude, radius: 100 });
          setSearchPoint({ latitude, longitude, radius: 100 });
        },
        (error) => {
          console.log("Ошибка получения геолокации:", error);
          toast.error("Не удалось определить ваше местоположение");
        }
      );
    } else {
      toast.error("Геолокация не поддерживается вашим браузером");
    }
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
        className="absolute right-4 bottom-4 z-1000"
        onClick={handleCardClick}
      >
        {showPointMenu && <Card className="w-96 text-black border-2">
          <button
            className="absolute top-2 right-2 p-1 hover:text-red-500"
            onClick={() => setShowPointMenu(false)}
          >
            <FaTimes />
          </button>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Радиус поиска (киллометры)
              </label>
              <input
                type="number"
                value={searchPoint?.radius || 1}
                onChange={handleRadiusChange}
                className="w-full p-1 border-solid border-2 rounded-md"
                onClick={e => e.stopPropagation()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
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
                className={`bg-zinc-900 rounded-full  ${
                  isSelectingPoint
                    ? 'bg-emerald-600 hover:bg-emerald-400'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                <FaMapMarkerAlt />
                {isSelectingPoint ? 'Кликните на карту' : 'Указать'}
              </Button>

              <Button
                onClick={handleGeolocation}
                className={ButtonStyle}
              >
                <FaMapMarkerAlt />
                Геолокация
              </Button>
              
              <Button
                onClick={handleClearFilters}
                className={ButtonStyle}
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