"use client"

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { NewsResponse, User } from '@/types/ApiTypes';
import Markdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

interface NewsContainerProps {
  news: NewsResponse;
  className?: string;
}

const NewsContainer: React.FC<NewsContainerProps> = ({ news, className }) => {

  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    api.getUserByID(news.creator_id).then((response) => {
      setOwner(response.data);
    });
  }, []);

  return (
    <div className={twMerge('p-4 w-full', className)}>
      <h1 className='text-2xl font-bold mt-4'>{news.title}</h1>
      <span className='text-sm text-gray-500'>{owner ? "@"+owner.nickname : 'loading...'}</span>
      <span className='text-sm text-gray-500 ml-2'>{
        new Date(news.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }</span>
      <Markdown className='w-full mt-4'>{news.content}</Markdown>
    </div>
  );
};

export default NewsContainer; 