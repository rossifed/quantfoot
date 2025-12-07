import React from 'react';

interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ label, value, icon }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex flex-col items-center p-4 bg-gradient-to-br from-dark-800 to-dark-700 rounded-lg border border-dark-600 hover:border-primary/50 transition-all">
        {icon && <span className="text-2xl mb-2">{icon}</span>}
        <span className="text-2xl font-bold bg-gradient-to-br from-white to-primary bg-clip-text text-transparent">{value}</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
};
