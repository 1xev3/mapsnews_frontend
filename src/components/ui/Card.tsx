// components/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;
