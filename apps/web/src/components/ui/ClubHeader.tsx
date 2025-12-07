import React from 'react';
import { Card } from './Card';
import { Club } from '@/types/team';

interface ClubHeaderProps {
  club: Club;
}

export const ClubHeader: React.FC<ClubHeaderProps> = ({ club }) => {
  return (
    <Card>
      <div className="flex items-start gap-6">
        {/* Club Logo */}
        <div className="flex-shrink-0">
          <img 
            src={club.logo} 
            alt={club.name}
            className="w-24 h-24 rounded-xl bg-white/10 p-3"
          />
        </div>

        {/* Club Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
          <p className="text-gray-400 mb-4">{club.city}, {club.country}</p>

          {/* Club Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Founded</div>
              <div className="font-semibold text-white">{club.founded}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Stadium</div>
              <div className="font-semibold text-white">{club.stadium}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <div className="font-semibold text-white text-sm">{club.address}</div>
            </div>
            {club.website && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Website</div>
                <a 
                  href={`https://${club.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  {club.website}
                </a>
              </div>
            )}
          </div>

          {/* Club Colors */}
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Club Colors</div>
            <div className="flex gap-2">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg" 
                style={{ backgroundColor: club.colors.primary }}
                title={club.colors.primary}
              />
              <div 
                className="w-12 h-12 rounded-lg border-2 border-dark-600 shadow-lg" 
                style={{ backgroundColor: club.colors.secondary }}
                title={club.colors.secondary}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
