import React from 'react';
import { Card } from './Card';
import { StatBadge } from './StatBadge';
import { PlayerStats } from '@/types/player';

interface PlayerStatsProps {
  stats: PlayerStats[];
}

export const PlayerStatsSection: React.FC<PlayerStatsProps> = ({ stats }) => {
  const currentSeason = stats[0];
  
  return (
    <Card title="Season Statistics 2024/25">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatBadge label="Appearances" value={currentSeason.appearances} icon="👕" />
        <StatBadge label="Goals" value={currentSeason.goals} icon="⚽" />
        <StatBadge label="Assists" value={currentSeason.assists} icon="🎯" />
        <StatBadge label="Minutes" value={currentSeason.minutesPlayed} icon="⏱️" />
        <StatBadge label="Yellow Cards" value={currentSeason.yellowCards} icon="🟨" />
        <StatBadge label="Red Cards" value={currentSeason.redCards} icon="🟥" />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Career History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="px-4 py-3 text-left font-semibold text-gray-300 bg-dark-800/50">Season</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1">
                    <span>Apps</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1">
                    <span>Goals</span>
                    <span>⚽</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 bg-dark-800/50">
                  <div className="flex items-center justify-center gap-1">
                    <span>Assists</span>
                    <span>🎯</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 bg-dark-800/50">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((season, idx) => (
                <tr key={idx} className="border-b border-dark-700/50 hover:bg-dark-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{season.season}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{season.appearances}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-secondary/20 border border-secondary/30 rounded font-semibold text-secondary">
                      {season.goals}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-primary/20 border border-primary/30 rounded font-semibold text-primary">
                      {season.assists}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">{season.minutesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
