"use client"

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { NewsResponse, User, GeoPointResponse } from '@/types/ApiTypes';
import { AxiosResponse } from 'axios';
import Markdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import { FaTimes, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import remarkGfm from 'remark-gfm'

import './NewsMarkdown.css';
import { useUser } from '@/lib/user_context';
interface NewsContainerProps {
  news: NewsResponse;
  className?: string;
  onGeoPointClick?: (latitude: number, longitude: number) => void;
  onClose?: () => void;
}

const NewsContainer: React.FC<NewsContainerProps> = ({ news, className, onGeoPointClick, onClose }) => {
  const { user } = useUser();

  const [owner, setOwner] = useState<User | null>(null);
  const [geoPoint, setGeoPoint] = useState<GeoPointResponse | null>(null);

  useEffect(() => {
    api.getUserByID(news.creator_id).then((response: AxiosResponse<User>) => {
      setOwner(response.data);
    }).catch(() => {
      //toast.error('Ошибка получения информации о пользователе');
    });

    // Fetch geo point data
    api.getGeoPointByID(news.geodata_id.toString()).then((response: AxiosResponse<GeoPointResponse>) => {
      setGeoPoint(response.data);
    }).catch(() => {
      //toast.error('Ошибка получения координат');
    });
  }, [news]);

  const handleDeleteNews = () => {
    api.deleteNews(news.id).then(() => {
      window.location.reload();
      toast.success('Новость удалена');
    }).catch(() => {
      //toast.error('Ошибка удаления новости');
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', 
      { day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
  }

  const handleShowOnMap = () => {
    if (geoPoint) {
      if (onGeoPointClick) {
        onGeoPointClick(geoPoint.latitude, geoPoint.longitude);
      }
      window.location.href = `/map?lat=${geoPoint.latitude}&lng=${geoPoint.longitude}&zoom=14`;
    }
  };

  return (
    <div className={twMerge('p-4 w-full relative', className)}>
      <h1 className='text-2xl font-bold mt-4'>{news.title}</h1>
      <span className='text-sm text-gray-500'>{owner ? "@"+owner.nickname : 'loading...'}</span>
      <span className='text-sm text-gray-500 ml-2'>{formatDate(news.created_at)}</span>
      <div className='flex flex-wrap gap-2'>
        {news.tags.map((tag) => (
          <span key={tag} className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md'>{tag}</span>
        ))}
      </div>
      <div className='absolute top-0 right-0 flex flex-row-reverse'>
        <Button variant='ghost' onClick={() => {
          if (onClose) {
            onClose();
          }
        }}>
          <FaTimes />
        </Button>

        {/* Кнопка удаления новости для админа */}
        {user && (user.group_id === 1) && (
          <Button variant='ghost' onClick={() => {
            handleDeleteNews();
          }}>
            <FaTrash />
          </Button>
        )}

        {geoPoint && (
          <Button 
            variant='ghost' 
            title="Показать на карте"
            onClick={handleShowOnMap}
          >
            <FaMapMarkerAlt />
          </Button>
        )}
      </div>
      <Markdown 
        components={{
          h1: 'h2',
        }}
        remarkPlugins={[remarkGfm]}
        className='w-full mt-4 markdown'>{`${news.content}`}
      </Markdown>
    </div>
  );
};

export default NewsContainer; 