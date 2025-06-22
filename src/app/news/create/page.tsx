'use client'

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import NavBar from '@/components/map/NavBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { Suspense } from "react";

import { useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import '@/components/news/NewsMarkdown.css';
import { Dropdown } from '@/components/ui/Dropdown';
// Dynamic imports
const MapWithNoSSR = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false
});
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), {ssr: false});

const CreateNewsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLat = parseFloat(searchParams.get('lat') || '55.75') || 55.75;
  const initialLng = parseFloat(searchParams.get('lng') || '37.61') || 37.61;

  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng]);
  const mapRef = useRef<L.Map | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

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
          mapRef.current.panTo([newLocation.latitude, newLocation.longitude]);
        }
        
        setIsLoadingLocation(false);
      },
      () => {
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
        longitude: location.longitude,
        tags: tags
      });
      router.push('/map');
    } catch {
      setError('Ошибка при создании новости');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
      setSelectedTag('');
      setIsTagDropdownOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    api.getNewsTags().then(res => setAllTags(res.data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 pt-16 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-4 border-1 border-gray-300 rounded-lg">
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
                <div className='flex flex-row gap-4'>
                  <MDEditor
                    className='w-1/2 min-h-[200px] !h-full'
                    value={content}
                    onChange={(value?: string) => setContent(value || '')}
                    previewOptions={{
                      rehypePlugins: [[rehypeSanitize]],
                      remarkPlugins: [[remarkGfm]],
                      components: {
                        h1: 'h2',
                      }
                    }}
                    height={"100%"}
                    visibleDragbar={false}
                    extraCommands={[]}
                    preview='edit'
                  />
                  <div className='w-1/2 h-full border-1 min-h-[200px] border-gray-300 rounded-md p-2'>
                    <Markdown 
                      components={{
                        h1: 'h2',
                      }}
                      remarkPlugins={[remarkGfm]}
                      className='mt-4 markdown'>{`${content}`}
                    </Markdown>
                  </div>
                </div>
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
                <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                  <MapWithNoSSR
                    mapRef={mapRef}
                    center={mapCenter}
                    zoom={10}
                    mapType="m"
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

                    {location && (
                      <p className="absolute bg-white rounded-lg px-2 left-1 border-1 border-gray-300 top-1 text-sm text-gray-500 z-1000">
                        Координаты: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    )}
                  </MapWithNoSSR>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Теги
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Dropdown
                      placeholder="Выберите тег..."
                      isOpened={isTagDropdownOpen}
                      setIsOpened={setIsTagDropdownOpen}
                      selfContent={selectedTag || "Выберите тег..."}
                    >
                      <div className="p-1">
                        {allTags
                          .filter(tag => !tags.includes(tag))
                          .map(tag => (
                            <div
                              key={tag}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedTag(tag);
                                setIsTagDropdownOpen(false);
                              }}
                            >
                              {tag}
                            </div>
                          ))}
                      </div>
                    </Dropdown>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!selectedTag}
                    className="px-4"
                  >
                    +
                  </Button>
                </div>
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

export default function Page() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CreateNewsPage />
    </Suspense>
  );
} 