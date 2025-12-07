import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { SquadPlayer, Coach } from '@/types/team';

interface TeamSquadProps {
  squad: SquadPlayer[];
  coach: Coach;
}

export const TeamSquad: React.FC<TeamSquadProps> = ({ squad, coach }) => {
  const navigate = useNavigate();

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const groupedByPosition = squad.reduce((acc, player) => {
    if (!acc[player.position]) acc[player.position] = [];
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, SquadPlayer[]>);

  const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'from-accent/20 to-accent/5 border-accent/30';
      case 'Defender': return 'from-primary/20 to-primary/5 border-primary/30';
      case 'Midfielder': return 'from-secondary/20 to-secondary/5 border-secondary/30';
      case 'Forward': return 'from-[#D83F6A]/20 to-[#D83F6A]/5 border-[#D83F6A]/30';
      default: return 'from-gray-500/20 to-gray-500/5 border-gray-500/30';
    }
  };

  return (
    <Card title="Squad">
      {/* Coach */}
      <div className="mb-6 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
        <div className="flex items-center gap-4">
          <img 
            src={coach.photo} 
            alt={coach.name}
            className="w-12 h-12 rounded-full bg-dark-700"
          />
          <div className="flex-1">
            <div className="font-semibold text-white">{coach.name}</div>
            <div className="text-sm text-gray-400">Head Coach • {coach.nationality} • Since {new Date(coach.since).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Players by Position */}
      <div className="space-y-8">
        {positionOrder.map(position => {
          const players = groupedByPosition[position] || [];
          if (players.length === 0) return null;

          return (
            <div key={position}>
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                {position}s ({players.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
                {players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => navigate(`/player/${player.id}`)}
                    className="group relative perspective-1000"
                  >
                    {/* Card Container with 3D flip effect */}
                    <div className="relative aspect-[2/3] preserve-3d transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
                      {/* Front of card */}
                      <div className={`absolute inset-0 rounded-xl border-2 bg-gradient-to-br ${getPositionColor(player.position)} backface-hidden overflow-hidden`}>
                        {/* Number Badge */}
                        <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-dark-900/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 z-10">
                          <span className="text-xs font-bold text-white">{player.number}</span>
                        </div>

                        {/* Player Photo */}
                        <div className="absolute inset-0 flex items-center justify-center pt-2">
                          <img 
                            src={player.photo} 
                            alt={player.name}
                            className="w-16 h-16 rounded-full bg-dark-700/50 backdrop-blur-sm border-2 border-white/20 object-cover"
                          />
                        </div>

                        {/* Player Info Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-dark-900 via-dark-900/95 to-transparent">
                          <div className="text-[10px] font-bold text-white truncate mb-0.5 leading-tight">{player.name}</div>
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-gray-400 truncate">{player.nationality}</span>
                            <span className="font-bold text-secondary ml-1">{formatValue(player.marketValue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Back of card - Mini chart */}
                      <div className={`absolute inset-0 rounded-xl border-2 bg-gradient-to-br ${getPositionColor(player.position)} backface-hidden [transform:rotateY(180deg)] overflow-hidden p-2`}>
                        <div className="h-full flex flex-col">
                          <div className="text-[10px] font-bold text-white mb-1">{player.name}</div>
                          
                          {/* Mini stats */}
                          <div className="flex-1 flex flex-col justify-center gap-1 text-[9px]">
                            <div className="flex justify-between items-center px-1 py-0.5 bg-dark-900/40 rounded">
                              <span className="text-gray-300">Value</span>
                              <span className="font-bold text-secondary">{formatValue(player.marketValue)}</span>
                            </div>
                            <div className="flex justify-between items-center px-1 py-0.5 bg-dark-900/40 rounded">
                              <span className="text-gray-300">Age</span>
                              <span className="font-bold text-white">{player.age}</span>
                            </div>
                            <div className="flex justify-between items-center px-1 py-0.5 bg-dark-900/40 rounded">
                              <span className="text-gray-300">Pos</span>
                              <span className="font-bold text-white">{player.position.substring(0, 3).toUpperCase()}</span>
                            </div>
                          </div>

                          {/* Trending indicator */}
                          <div className="mt-auto pt-1 border-t border-white/10">
                            <div className="flex items-center justify-center gap-1 text-secondary text-[9px] font-bold">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span>+12%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
