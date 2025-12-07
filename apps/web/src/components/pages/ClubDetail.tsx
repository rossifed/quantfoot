import React from 'react';
import { useParams } from 'react-router-dom';
import { ClubHeader } from '@/components/ui/ClubHeader';
import { ClubTeamsList } from '@/components/ui/ClubTeamsList';
import { mockClub, mockClubTeams } from '@/lib/mockData';

export const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // In real app, fetch club by ID
  const club = mockClub;

  if (!club) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Club Not Found</h1>
          <p className="text-gray-400">The club you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Club Header */}
        <ClubHeader club={club} />

        {/* Teams */}
        <ClubTeamsList teams={mockClubTeams} />
      </div>
    </div>
  );
};
