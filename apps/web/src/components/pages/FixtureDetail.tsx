import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockFixtureDetail } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { LivePlayerChart } from '@/components/ui/LivePlayerChart';
import { FixturePlayer } from '@/types/team';

export function FixtureDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'info' | 'trading'>('info');
  
  // For now, use mockFixtureDetail for all IDs
  // In a real app, you'd fetch based on the ID
  const fixture = mockFixtureDetail;

  if (!fixture) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <p className="text-gray-400">Match not found</p>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    switch (fixture.status) {
      case 'live':
        return (
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-full animate-pulse">
              LIVE
            </span>
            <span className="text-2xl font-bold text-white">{fixture.time}</span>
          </div>
        );
      case 'finished':
        return (
          <span className="px-4 py-2 bg-gray-600/50 text-gray-300 text-sm font-semibold rounded-full">
            FINISHED
          </span>
        );
      default:
        return (
          <span className="px-4 py-2 bg-primary/20 text-primary text-sm font-semibold rounded-full">
            SCHEDULED
          </span>
        );
    }
  };

  const renderEvent = (event: typeof fixture.events[0]) => {
    const getEventIcon = () => {
      switch (event.type) {
        case 'goal':
          return '⚽';
        case 'yellow_card':
          return '🟨';
        case 'red_card':
          return '🟥';
        case 'substitution':
          return '🔄';
        case 'penalty':
          return '🎯';
        default:
          return '•';
      }
    };

    return (
      <div
        key={`${event.time}-${event.player}`}
        className={`flex items-center gap-3 p-3 rounded-lg ${
          event.team === 'home' ? 'bg-primary/10' : 'bg-secondary/10'
        }`}
      >
        <span className="text-sm font-bold text-gray-400 w-8">{event.time}'</span>
        <span className="text-xl">{getEventIcon()}</span>
        <div className="flex-1">
          <div className="font-semibold text-white">{event.player}</div>
          {event.detail && <div className="text-xs text-gray-400">{event.detail}</div>}
        </div>
      </div>
    );
  };

  const formatValue = (value: number) => {
    return `€${(value / 1000000).toFixed(2)}M`;
  };

  const getValueChange = (player: FixturePlayer) => {
    if (!player.liveValue) return null;
    const change = player.liveValue - player.marketValue;
    const percentage = (change / player.marketValue) * 100;
    const isPositive = change >= 0;
    
    return (
      <span className={`text-xs font-bold ${isPositive ? 'text-secondary' : 'text-danger'}`}>
        {isPositive ? '+' : ''}{percentage.toFixed(1)}%
      </span>
    );
  };

  const renderTradingPlayer = (player: FixturePlayer, team: 'home' | 'away') => (
    <div key={player.id} className="grid grid-cols-12 gap-4 p-4 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors items-center">
      {/* Player Info */}
      <div className="col-span-3 flex items-center gap-3">
        <img
          src={player.photo}
          alt={player.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div>
          <div className="font-semibold text-white text-sm">{player.name}</div>
          <div className="text-xs text-gray-400">
            #{player.number} • {player.position}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="col-span-2 flex items-center gap-2 text-xs">
        {player.stats?.goals !== undefined && player.stats.goals > 0 && (
          <span className="text-secondary">⚽ {player.stats.goals}</span>
        )}
        {player.stats?.assists !== undefined && player.stats.assists > 0 && (
          <span className="text-primary">🎯 {player.stats.assists}</span>
        )}
        {player.stats?.rating && (
          <span className="font-bold text-accent">⭐ {player.stats.rating}</span>
        )}
      </div>

      {/* Live Chart */}
      <div className="col-span-4 h-16">
        <LivePlayerChart data={player.valueHistory} playerName={player.name} />
      </div>

      {/* Value & Change */}
      <div className="col-span-1 text-right">
        <div className="text-sm font-bold text-white">
          {formatValue(player.liveValue || player.marketValue)}
        </div>
        {getValueChange(player)}
      </div>

      {/* Trading Buttons */}
      <div className="col-span-2 flex gap-2">
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
  );

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Competition & Date */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              {fixture.competition}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(fixture.date)}
            </div>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-center gap-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-xs">
              <img
                src={fixture.homeTeam.logo}
                alt={fixture.homeTeam.name}
                className="w-24 h-24 object-contain"
              />
              <h2 className="text-2xl font-bold text-white text-center">
                {fixture.homeTeam.name}
              </h2>
            </div>

            {/* Score */}
            <div className="text-center">
              {fixture.status === 'scheduled' ? (
                <div className="text-4xl font-bold text-gray-500">VS</div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-bold text-white">
                    {fixture.homeTeam.score}
                  </span>
                  <span className="text-4xl text-gray-500">-</span>
                  <span className="text-6xl font-bold text-white">
                    {fixture.awayTeam.score}
                  </span>
                </div>
              )}
              <div className="mt-4">{getStatusBadge()}</div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-xs">
              <img
                src={fixture.awayTeam.logo}
                alt={fixture.awayTeam.name}
                className="w-24 h-24 object-contain"
              />
              <h2 className="text-2xl font-bold text-white text-center">
                {fixture.awayTeam.name}
              </h2>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
            activeTab === 'info'
              ? 'bg-primary text-white'
              : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
          }`}
        >
          Match Information
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
            activeTab === 'trading'
              ? 'bg-secondary text-white'
              : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
          }`}
        >
          Live Trading
          {fixture.status === 'live' && (
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Match Information Tab */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Match Details */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Match Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Venue</div>
                <div className="text-sm font-semibold text-white">{fixture.venue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Referee</div>
                <div className="text-sm font-semibold text-white">{fixture.referee}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Attendance</div>
                <div className="text-sm font-semibold text-white">
                  {fixture.attendance?.toLocaleString() || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</div>
                <div className="text-sm font-semibold text-white capitalize">{fixture.status}</div>
              </div>
            </div>
          </Card>

          {/* Match Events */}
          {fixture.events && fixture.events.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Match Events</h3>
              <div className="space-y-2">
                {fixture.events.map(event => renderEvent(event))}
              </div>
            </Card>
          )}

          {/* Lineups */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Starting Lineups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Home Team Lineup */}
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <img src={fixture.homeTeam.logo} alt="" className="w-6 h-6" />
                  {fixture.homeTeam.name}
                </h4>
                <div className="space-y-2">
                  {fixture.homeLineup.map(player => (
                    <div key={player.id} className="flex items-center gap-3 p-2 bg-dark-800/30 rounded">
                      <span className="text-xs font-bold text-gray-400 w-6">#{player.number}</span>
                      <img src={player.photo} alt={player.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Team Lineup */}
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <img src={fixture.awayTeam.logo} alt="" className="w-6 h-6" />
                  {fixture.awayTeam.name}
                </h4>
                <div className="space-y-2">
                  {fixture.awayLineup.map(player => (
                    <div key={player.id} className="flex items-center gap-3 p-2 bg-dark-800/30 rounded">
                      <span className="text-xs font-bold text-gray-400 w-6">#{player.number}</span>
                      <img src={player.photo} alt={player.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Live Trading Tab */}
      {activeTab === 'trading' && (
        <div className="space-y-6">
          {fixture.status === 'live' && (
            <div className="flex items-center justify-center gap-2 text-secondary animate-pulse p-4 bg-secondary/10 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="font-bold">Real-time values updating</span>
            </div>
          )}

          {/* Home Team Trading */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <img src={fixture.homeTeam.logo} alt="" className="w-6 h-6" />
              {fixture.homeTeam.name} - Trading
            </h3>
            <div className="space-y-2">
              {fixture.homeLineup.map(player => renderTradingPlayer(player, 'home'))}
            </div>
          </Card>

          {/* Away Team Trading */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <img src={fixture.awayTeam.logo} alt="" className="w-6 h-6" />
              {fixture.awayTeam.name} - Trading
            </h3>
            <div className="space-y-2">
              {fixture.awayLineup.map(player => renderTradingPlayer(player, 'away'))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
