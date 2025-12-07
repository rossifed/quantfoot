import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockClubs } from '@/lib/mockData';

export const ClubsList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const countries = ['all', ...Array.from(new Set(mockClubs.map(c => c.country)))];

  const filteredClubs = mockClubs.filter(club => {
    if (selectedCountry !== 'all' && club.country !== selectedCountry) return false;
    return true;
  });

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Clubs</h1>
          <p className="text-gray-400">Explore football clubs and their teams</p>
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
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <button
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
              className="group relative p-6 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary/50 transition-all hover:scale-[1.02] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative flex items-start gap-4">
                {/* Club Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={club.logo} 
                    alt={club.name}
                    className="w-16 h-16 rounded-lg bg-white/10 p-2"
                  />
                </div>

                {/* Club Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{club.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{club.city}, {club.country}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Founded {club.founded}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {club.stadium}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="flex gap-2 mt-3">
                    <div 
                      className="w-6 h-6 rounded border border-dark-600" 
                      style={{ backgroundColor: club.colors.primary }}
                      title={club.colors.primary}
                    />
                    <div 
                      className="w-6 h-6 rounded border border-dark-600" 
                      style={{ backgroundColor: club.colors.secondary }}
                      title={club.colors.secondary}
                    />
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
        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No clubs found with the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
