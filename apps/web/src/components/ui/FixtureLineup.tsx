import { useNavigate } from 'react-router-dom';
import { FixturePlayer } from '@/types/team';
import { Card } from '@/components/ui/Card';
import { LivePlayerChart } from '@/components/ui/LivePlayerChart';

interface FixtureLineupProps {
  homeLineup: FixturePlayer[];
  awayLineup: FixturePlayer[];
  homeTeamName: string;
  awayTeamName: string;
}

export function FixtureLineup({ homeLineup, awayLineup, homeTeamName, awayTeamName }: FixtureLineupProps) {
  const navigate = useNavigate();

  const formatValue = (value: number) => {
    return `€${(value / 1000000).toFixed(2)}M`;
  };

  const getValueChange = (player: FixturePlayer) => {
    if (!player.liveValue) return null;
    const change = player.liveValue - player.marketValue;
    const percentage = (change / player.marketValue) * 100;
    const isPositive = change >= 0;
    
    return (
      <div className={`text-sm font-bold ${isPositive ? 'text-secondary' : 'text-danger'}`}>
        {isPositive ? '+' : ''}{percentage.toFixed(1)}%
      </div>
    );
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK':
        return 'from-accent via-orange-600 to-orange-700';
      case 'DEF':
        return 'from-primary via-blue-600 to-blue-700';
      case 'MID':
        return 'from-secondary via-green-600 to-green-700';
      case 'FWD':
        return 'from-danger via-rose-600 to-rose-700';
      default:
        return 'from-gray-500 via-gray-600 to-gray-700';
    }
  };

  const renderPlayerCard = (player: FixturePlayer, teamSide: 'home' | 'away') => (
    <Card
      key={player.id}
      className="p-4 hover:border-primary/50 transition-all cursor-pointer group"
      onClick={() => navigate(`/player/${player.id}`)}
    >
      <div className="space-y-4">
        {/* Player Info */}
        <div className="flex items-start gap-3">
          <div className={`relative flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${getPositionColor(player.position)} p-0.5`}>
            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-800">
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800">
              <span className="text-xs font-bold text-white">{player.number}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
              {player.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold">{player.position}</span>
              {player.stats && (
                <>
                  {player.stats.goals !== undefined && player.stats.goals > 0 && (
                    <span className="text-secondary">⚽ {player.stats.goals}</span>
                  )}
                  {player.stats.assists !== undefined && player.stats.assists > 0 && (
                    <span className="text-primary">🎯 {player.stats.assists}</span>
                  )}
                  {player.stats.yellowCards !== undefined && player.stats.yellowCards > 0 && (
                    <span className="text-yellow-500">🟨 {player.stats.yellowCards}</span>
                  )}
                  {player.stats.redCards !== undefined && player.stats.redCards > 0 && (
                    <span className="text-red-500">🟥 {player.stats.redCards}</span>
                  )}
                  {player.stats.rating && (
                    <span className="font-bold text-accent">⭐ {player.stats.rating}</span>
                  )}
                </>
              )}
            </div>
            <div className="mt-1">
              <div className="text-xs text-gray-500">Market Value</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {formatValue(player.liveValue || player.marketValue)}
                </span>
                {getValueChange(player)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Chart */}
        <div className="h-24 bg-slate-900/50 rounded-lg p-2">
          <LivePlayerChart data={player.valueHistory} playerName={player.name} />
        </div>

        {/* Trade Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement buy action
            }}
            className="flex-1 py-2 bg-gradient-to-r from-secondary to-green-600 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            BUY
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement sell action
            }}
            className="flex-1 py-2 btn-sell text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            SELL
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Home Team */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">{homeTeamName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {homeLineup.map(player => renderPlayerCard(player, 'home'))}
        </div>
      </div>

      {/* Away Team */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">{awayTeamName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {awayLineup.map(player => renderPlayerCard(player, 'away'))}
        </div>
      </div>
    </div>
  );
}
