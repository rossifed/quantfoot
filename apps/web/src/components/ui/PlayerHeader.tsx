import React from 'react';
import { Player } from '@/types/player';

interface PlayerHeaderProps {
  player: Player;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-dark-800 to-secondary/20 text-white p-8 rounded-xl shadow-2xl border border-dark-700">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="relative flex items-start gap-8">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary blur-xl opacity-50"></div>
            <img
              src={player.photo}
              alt={player.name}
              className="relative w-32 h-32 rounded-full border-4 border-primary shadow-2xl"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">{player.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-sm">
              {player.position}
            </span>
            <span className="px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-sm">
              {player.club}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm opacity-80">Age</p>
              <p className="text-xl font-semibold">{player.age}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Nationality</p>
              <p className="text-xl font-semibold">{player.nationality}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Foot</p>
              <p className="text-xl font-semibold">{player.foot}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Height / Weight</p>
              <p className="text-xl font-semibold">{player.height} / {player.weight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
