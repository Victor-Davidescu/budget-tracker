import React from 'react';

const SummaryCard = ({ 
  title, 
  value, 
  percentage, 
  icon: Icon, 
  bgColor = 'bg-white', 
  borderColor = 'border-gray-200',
  titleColor = 'text-gray-600',
  valueColor = 'text-gray-700',
  percentageColor = 'text-gray-600',
  iconColor = 'text-gray-600',
  children 
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${titleColor}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-3xl font-bold ${valueColor}`}>
              {value}
            </p>
            {percentage && (
              <p className={`text-lg font-semibold ${percentageColor}`}>
                {percentage}
              </p>
            )}
          </div>
          {children}
        </div>
        {Icon && <Icon className={iconColor} size={40} />}
      </div>
    </div>
  );
};

export default SummaryCard;