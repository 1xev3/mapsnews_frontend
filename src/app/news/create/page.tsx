'use client'

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/map/NavBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

import { useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

// Dynamic imports
const MapWithNoSSR = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false
});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});

const CreateNewsPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([55.75, 37.61]);
  const mapRef = useRef<any>(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLocation({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      },
    });
    return null;
  };

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(newLocation);
        setMapCenter([newLocation.latitude, newLocation.longitude]);
        
        if (mapRef.current) {
          mapRef.current.panTo([newLocation.latitude, newLocation.longitude], 10);
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        setError('Не удалось получить текущее местоположение');
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!location) {
      setError('Пожалуйста, укажите местоположение на карте');
      setIsLoading(false);
      return;
    }

    try {
      await api.createNews({
        title,
        content,
        latitude: location.latitude,
        longitude: location.longitude
      });
      router.push('/map');
    } catch (err) {
      setError('Ошибка при создании новости');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 pt-16 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-4">
            <h1 className="text-2xl font-bold mb-4">Создание новости</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div data-color-mode="light">
                <label className="block text-sm font-medium text-gray-700">
                  Содержание
                </label>
                <MDEditor
                  value={content}
                  onChange={(value?: string) => setContent(value || '')}
                  previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Местоположение
                </label>
                <Button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  className="mb-2"
                >
                  {!isLoadingLocation && <>
                    <FaMapMarkerAlt />
                    <span>Определить</span>
                  </>}
                </Button>
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <MapWithNoSSR
                    mapRef={mapRef}
                    center={mapCenter}
                    zoom={10}
                    mapType="m"
                    onMarkerClick={() => {}}
                  >
                    <MapClickHandler />
                    {location && (
                      <>
                        <div 
                          className="absolute w-4 h-4 bg-red-500 rounded-full -ml-2 -mt-2"
                          style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />

                      <Marker
                        key={location.latitude + location.longitude}
                        position={[location.latitude, location.longitude]}
                        zIndexOffset={1000}
                      />
                    </>
                    )}
                  </MapWithNoSSR>
                </div>
                {location && (
                  <p className="text-sm text-gray-500 mt-2">
                    Координаты: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Создание...' : 'Создать новость'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsPage; 