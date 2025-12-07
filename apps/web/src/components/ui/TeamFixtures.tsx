import React from 'react';
import { Card } from './Card';
import { Fixture } from '@/types/team';

interface TeamFixturesProps {
  fixtures: Fixture[];
}

export const TeamFixtures: React.FC<TeamFixturesProps> = ({ fixtures }) => {
  const getStatusBadge = (status: Fixture['status']) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-1 text-xs font-bold bg-danger/20 text-danger rounded animate-pulse">LIVE</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">Scheduled</span>;
      case 'finished':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-400 rounded">FT</span>;
    }
  };

  const sortedFixtures = [...fixtures].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card title="Fixtures">
      <div className="space-y-2">
        {sortedFixtures.map(fixture => (
          <div 
            key={fixture.id}
            className="p-3 bg-dark-800/30 rounded-lg border border-dark-700 hover:border-primary/30 transition-all"
          >
            {/* Header: Date & Status */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">
                {new Date(fixture.date).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {getStatusBadge(fixture.status)}
            </div>

            {/* Match */}
            <div className="flex items-center justify-between gap-4 mb-2">
              {/* Home Team */}
              <div className="flex items-center gap-3 flex-1">
                <img src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} className="w-8 h-8" />
                <span className="font-medium text-white">{fixture.homeTeam.name}</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3 px-4">
                {fixture.status === 'finished' || fixture.status === 'live' ? (
                  <div className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-white">{fixture.homeTeam.score}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-white">{fixture.awayTeam.score}</span>
                  </div>
                ) : (
                  <span className="text-gray-600 font-medium">vs</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-medium text-white">{fixture.awayTeam.name}</span>
                <img src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} className="w-8 h-8" />
              </div>
            </div>

            {/* Footer: Competition & Venue */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-dark-700">
              <span>{fixture.competition}</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {fixture.venue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
