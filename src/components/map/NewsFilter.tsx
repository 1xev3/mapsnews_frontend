import React, { useState, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import Card from '../ui/Card';
import { saveUserLocation, getUserLocation } from '@/lib/location_storage';
import { FaTh } from 'react-icons/fa';

interface NewsFilterProps {
  onFilterChange: (filters: {
    radius: number;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const NewsFilter: React.FC<NewsFilterProps> = ({ onFilterChange }) => {
  const savedLocation = getUserLocation();

  const [radius, setRadius] = useState<number>(savedLocation?.radius || 10000);
  const [point, setPoint] = useState<{lat: number; lng: number} | null>({
    lat: savedLocation?.latitude || 0,
    lng: savedLocation?.longitude || 0
  });
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isSelectingPoint) {
          const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
          setPoint(newPoint);
          setIsSelectingPoint(false);
          saveUserLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng, radius: radius });
          onFilterChange({
            radius,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
        }
      },
    });
    return null;
  };

  useEffect(() => {
    if (point) {
      onFilterChange({
        radius,
        latitude: point.lat,
        longitude: point.lng,
      });
      saveUserLocation({ latitude: point.lat, longitude: point.lng, radius: radius });
    }
  }, [radius, point]);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = Number(e.target.value);
    setRadius(newRadius);
  };

  const handleSelectPoint = () => {
    setIsSelectingPoint(true);
  };

  const handleClearFilters = () => {
    setPoint(null);
    setIsSelectingPoint(false);
    onFilterChange({ radius });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <MapClickHandler />
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
                value={radius}
                onChange={handleRadiusChange}
                className="w-full p-1 border-solid border-2 border-emerald-400 rounded-md"
                onClick={e => e.stopPropagation()}
              />
              <span className="text-sm text-gray-500">{radius} м</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Точка поиска
              </label>
              {point ? (
                <div className="text-sm text-gray-500">
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
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