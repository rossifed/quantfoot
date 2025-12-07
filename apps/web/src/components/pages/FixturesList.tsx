import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockFixtures } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';

export function FixturesList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'today' | 'past' | 'upcoming'>('today');

  const today = new Date('2024-12-07');
  today.setHours(0, 0, 0, 0);

  const filteredFixtures = useMemo(() => {
    return mockFixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.date);
      fixtureDate.setHours(0, 0, 0, 0);

      if (filter === 'all') return true;
      if (filter === 'today') return fixtureDate.getTime() === today.getTime();
      if (filter === 'past') return fixtureDate < today;
      if (filter === 'upcoming') return fixtureDate > today;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full animate-pulse">
            LIVE
          </span>
        );
      case 'finished':
        return (
          <span className="px-3 py-1 bg-gray-600/50 text-gray-300 text-xs font-semibold rounded-full">
            FT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Fixtures
        </h1>
        <p className="text-gray-400">
          Follow all live matches and trade in real-time
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'today'
                ? 'bg-primary text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-primary text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
        </div>
      </Card>

      {/* Fixtures List */}
      <div className="space-y-4">
        {filteredFixtures.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No matches found</p>
          </Card>
        ) : (
          filteredFixtures.map(fixture => {
            const { day, time } = formatDate(fixture.date);
            return (
              <Card
                key={fixture.id}
                className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/fixture/${fixture.id}`)}
              >
                <div className="flex items-center gap-6">
                  {/* Date & Time */}
                  <div className="flex-shrink-0 text-center w-20">
                    <div className="text-sm text-gray-400">{day}</div>
                    <div className="text-lg font-bold text-white">{time}</div>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                      {fixture.homeTeam.name}
                    </span>
                    <img
                      src={fixture.homeTeam.logo}
                      alt={fixture.homeTeam.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  {/* Score or Status */}
                  <div className="flex-shrink-0 w-24 text-center">
                    {fixture.status === 'scheduled' ? (
                      <div className="text-gray-500 font-bold text-xl">VS</div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {fixture.homeTeam.score}
                        </span>
                        <span className="text-gray-500">-</span>
                        <span className="text-2xl font-bold text-white">
                          {fixture.awayTeam.score}
                        </span>
                      </div>
                    )}
                    <div className="mt-1">{getStatusBadge(fixture.status)}</div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={fixture.awayTeam.logo}
                      alt={fixture.awayTeam.name}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                      {fixture.awayTeam.name}
                    </span>
                  </div>

                  {/* Competition */}
                  <div className="flex-shrink-0 text-right w-40">
                    <div className="text-sm text-gray-400">{fixture.competition}</div>
                    <div className="text-xs text-gray-500">{fixture.venue}</div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
