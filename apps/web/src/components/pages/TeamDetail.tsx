import React from 'react';
import { useParams } from 'react-router-dom';
import { TeamHeader } from '@/components/ui/TeamHeader';
import { TeamSquad } from '@/components/ui/TeamSquad';
import { TeamFixtures } from '@/components/ui/TeamFixtures';
import { TeamTransfers } from '@/components/ui/TeamTransfers';
import { TeamValueSection } from '@/components/ui/TeamValueSection';
import { mockTeams, mockSquad, mockCoach, mockFixtures, mockTeamTransfers, mockTeamValueHistory } from '@/lib/mockData';

export const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const team = mockTeams.find(t => t.id === Number(id));

  if (!team) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Team Not Found</h1>
          <p className="text-gray-400">The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <TeamHeader team={team} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Market Value Chart - Full Width at Top */}
          <TeamValueSection valueHistory={mockTeamValueHistory} />

          {/* Squad Cards - Compact Grid */}
          <TeamSquad squad={mockSquad} coach={mockCoach} />

          {/* Fixtures & Transfers Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamFixtures fixtures={mockFixtures} />
            <TeamTransfers transfers={mockTeamTransfers} />
          </div>
        </div>
      </div>
    </div>
  );
};
