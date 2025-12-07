import React from 'react';
import { Card } from './Card';
import { Player } from '@/types/player';

interface PlayerOverviewProps {
  player: Player;
}

export const PlayerOverview: React.FC<PlayerOverviewProps> = ({ player }) => {
  return (
    <Card title="Player Overview">
      <div className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-300 leading-relaxed text-sm">
            {player.description}
          </p>
        </div>

        {/* Strengths */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Key Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {player.strengths.map((strength, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-xs text-primary font-medium"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>

        {/* Playing Style */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Playing Style</h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            {player.playingStyle}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-dark-700">
          <div className="text-center">
            <div className="text-xl font-bold text-white">8.5</div>
            <div className="text-xs text-gray-400">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-secondary">92%</div>
            <div className="text-xs text-gray-400">Form</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">High</div>
            <div className="text-xs text-gray-400">Potential</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
