import React from 'react';

const TitleBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-blue-600 text-white p-4 shadow-md z-20">
      <h1 className="text-xl font-semibold">Интерактивная карта новостей</h1>
    </div>
  );
};

export default TitleBar;