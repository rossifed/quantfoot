import React, { useEffect, useState } from 'react';
import { PlayerHeader } from '@/components/ui/PlayerHeader';
import { PlayerOverview } from '@/components/ui/PlayerOverview';
import { PlayerStatsSection } from '@/components/ui/PlayerStatsSection';
import { PlayerVideos } from '@/components/ui/PlayerVideos';
import { PlayerTransfers } from '@/components/ui/PlayerTransfers';
import { PlayerValueSection } from '@/components/ui/PlayerValueSection';
import { playersApi, type Player } from '@/services/playersApi';
import { 
  mockPlayer, 
  mockStats, 
  mockVideos, 
  mockTransfers, 
  mockValueHistory 
} from '@/lib/mockData';

export const PlayerProfile: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const data = await playersApi.getPlayerById(48614);
        setPlayer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player');
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading player data...</div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-500">{error || 'Player not found'}</div>
        </div>
      </div>
    );
  }

  // Map API player to mock player format for existing components
  const mappedPlayer = {
    ...mockPlayer,
    id: player.id,
    name: player.playerName,
    position: player.position || mockPlayer.position,
    number: player.jerseyNumber || mockPlayer.number,
    age: player.age || mockPlayer.age,
    photo: player.photoUrl || mockPlayer.photo,
    team: {
      name: player.team?.teamName || mockPlayer.team.name,
      logo: player.team?.teamLogo || mockPlayer.team.logo,
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <PlayerHeader player={mappedPlayer} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <PlayerOverview player={mappedPlayer} />
            <PlayerTransfers transfers={mockTransfers} />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <PlayerValueSection valueHistory={mockValueHistory} />
            <PlayerStatsSection stats={mockStats} />
            <PlayerVideos videos={mockVideos} />
          </div>
        </div>
      </div>
    </div>
  );
};
