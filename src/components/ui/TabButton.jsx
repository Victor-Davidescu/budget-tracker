import React from 'react';

const TabButton = ({ 
  isActive, 
  onClick, 
  children, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium capitalize transition-colors ${
        isActive
          ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default TabButton;