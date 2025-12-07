import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTeams } from '@/lib/mockData';

export const TeamsList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const countries = ['all', ...Array.from(new Set(mockTeams.map(t => t.country)))];
  const leagues = ['all', ...Array.from(new Set(mockTeams.map(t => t.league)))];

  const filteredTeams = mockTeams.filter(team => {
    if (selectedCountry !== 'all' && team.country !== selectedCountry) return false;
    if (selectedLeague !== 'all' && team.league !== selectedLeague) return false;
    return true;
  });

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Teams</h1>
          <p className="text-gray-400">Explore football teams across different leagues and countries</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">League</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            >
              {leagues.map(league => (
                <option key={league} value={league}>
                  {league === 'all' ? 'All Leagues' : league}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => (
            <button
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`)}
              className="group relative p-6 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary/50 transition-all hover:scale-[1.02] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative flex items-start gap-4">
                {/* Team Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={team.logo} 
                    alt={team.name}
                    className="w-16 h-16 rounded-lg bg-white/10 p-2"
                  />
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{team.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{team.city}, {team.country}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
                      {team.league}
                    </span>
                    {team.leagueRank && (
                      <span className="px-2 py-1 text-xs font-medium bg-secondary/20 text-secondary rounded">
                        #{team.leagueRank}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {team.stadium}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-6 right-6 text-gray-600 group-hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* No Results */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No teams found with the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
