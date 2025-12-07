import React from 'react';
import { PlayerHeader } from '@/components/ui/PlayerHeader';
import { PlayerOverview } from '@/components/ui/PlayerOverview';
import { PlayerStatsSection } from '@/components/ui/PlayerStatsSection';
import { PlayerVideos } from '@/components/ui/PlayerVideos';
import { PlayerTransfers } from '@/components/ui/PlayerTransfers';
import { PlayerValueSection } from '@/components/ui/PlayerValueSection';
import { 
  mockPlayer, 
  mockStats, 
  mockVideos, 
  mockTransfers, 
  mockValueHistory 
} from '@/lib/mockData';

export const PlayerProfile: React.FC = () => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <PlayerHeader player={mockPlayer} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <PlayerOverview player={mockPlayer} />
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
