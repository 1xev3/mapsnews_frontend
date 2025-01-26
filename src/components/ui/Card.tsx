// components/Card.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={twMerge('bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg', className)}>
      {children}
    </div>
  );
};

export default Card;
