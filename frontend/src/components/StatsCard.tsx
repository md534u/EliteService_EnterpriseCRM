import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: React.ReactNode;
  subtextClassName?: string;
  icon: React.ReactNode;
  iconWrapperClassName?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtext,
  subtextClassName = "text-gray-500",
  icon,
  iconWrapperClassName = "bg-gray-50 text-gray-600",
  className = ""
}) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-300 flex justify-between items-start transition-all hover:shadow-md ${className}`}>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        {subtext && (
          <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${subtextClassName}`}>
            {subtext}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconWrapperClassName}`}>
        {icon}
      </div>
    </div>
  );
};
