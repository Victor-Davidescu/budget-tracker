import React from 'react';

const ProgressBar = ({ 
  percentage, 
  color = 'bg-blue-600', 
  bgColor = 'bg-gray-200',
  height = 'h-3',
  showLabel = true,
  label = 'Progress',
  className = ''
}) => {
  const clampedPercentage = Math.min(Math.max(percentage || 0, 0), 100);
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{label}</span>
          <span className="font-semibold">{clampedPercentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full ${bgColor} rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${clampedPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;