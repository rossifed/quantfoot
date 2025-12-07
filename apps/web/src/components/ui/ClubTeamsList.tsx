import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { ClubTeam } from '@/types/team';

interface ClubTeamsListProps {
  teams: ClubTeam[];
}

export const ClubTeamsList: React.FC<ClubTeamsListProps> = ({ teams }) => {
  const navigate = useNavigate();

  const getTeamTypeColor = (type: ClubTeam['type']) => {
    switch (type) {
      case 'First Team': return 'from-primary/20 to-primary/5 border-primary/40';
      case 'Reserve': return 'from-secondary/20 to-secondary/5 border-secondary/40';
      case 'Youth': return 'from-accent/20 to-accent/5 border-accent/40';
      case 'Women': return 'from-[#D83F6A]/20 to-[#D83F6A]/5 border-[#D83F6A]/40';
    }
  };

  const getTeamTypeIcon = (type: ClubTeam['type']) => {
    switch (type) {
      case 'First Team': return '⭐';
      case 'Reserve': return '🔷';
      case 'Youth': return '🌱';
      case 'Women': return '💜';
    }
  };

  return (
    <Card title="Teams">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => navigate(`/team/${team.id}`)}
            className="group relative"
          >
            <div className={`p-6 rounded-xl border-2 bg-gradient-to-br ${getTeamTypeColor(team.type)} hover:scale-105 transition-all duration-300`}>
              {/* Icon */}
              <div className="text-4xl mb-3 text-center">{getTeamTypeIcon(team.type)}</div>
              
              {/* Team Name */}
              <h3 className="text-lg font-bold text-white text-center mb-2">{team.name}</h3>
              
              {/* League */}
              <div className="text-xs text-gray-400 text-center mb-3">{team.league}</div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-gray-400">{team.squadSize} players</span>
                </div>
                {team.leagueRank && (
                  <div className="px-2 py-0.5 bg-secondary/20 text-secondary rounded font-bold">
                    #{team.leagueRank}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="absolute top-3 right-3 text-gray-600 group-hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
