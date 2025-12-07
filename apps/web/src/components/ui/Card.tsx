import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`glass-card rounded-xl shadow-xl overflow-hidden border border-dark-700 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
