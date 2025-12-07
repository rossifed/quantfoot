import React from 'react';
import { Card } from './Card';
import { Team } from '@/types/team';

interface TeamHeaderProps {
  team: Team;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ team }) => {
  return (
    <Card>
      <div className="flex items-start gap-6">
        {/* Team Logo */}
        <div className="flex-shrink-0">
          <img 
            src={team.logo} 
            alt={team.name}
            className="w-24 h-24 rounded-xl bg-white/10 p-3"
          />
        </div>

        {/* Team Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
              <p className="text-gray-400">{team.city}, {team.country}</p>
            </div>
            {team.leagueRank && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">#{team.leagueRank}</div>
                <div className="text-xs text-gray-500">League Rank</div>
              </div>
            )}
          </div>

          {/* Team Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">League</div>
              <div className="font-semibold text-white">{team.league}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Stadium</div>
              <div className="font-semibold text-white">{team.stadium}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Founded</div>
              <div className="font-semibold text-white">{team.founded}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Colors</div>
              <div className="flex gap-2">
                <div 
                  className="w-6 h-6 rounded border border-dark-600" 
                  style={{ backgroundColor: team.colors.primary }}
                  title={team.colors.primary}
                />
                <div 
                  className="w-6 h-6 rounded border border-dark-600" 
                  style={{ backgroundColor: team.colors.secondary }}
                  title={team.colors.secondary}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
