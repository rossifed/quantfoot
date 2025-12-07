import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-900 to-secondary/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                QuantFoot
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Your advanced football analytics and trading platform. Track players, analyze teams, and make data-driven decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Clubs Card */}
          <button
            onClick={() => navigate('/clubs')}
            className="group relative p-8 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-secondary/50 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Clubs</h3>
              <p className="text-gray-400">Explore clubs and their teams</p>
            </div>
          </button>

          {/* Teams Card */}
          <button
            onClick={() => navigate('/teams')}
            className="group relative p-8 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary/50 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Teams</h3>
              <p className="text-gray-400">Explore teams by league and analyze squad composition</p>
            </div>
          </button>

          {/* Fixtures Card */}
          <button
            onClick={() => navigate('/fixtures')}
            className="group relative p-8 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Fixtures</h3>
              <p className="text-gray-400">Follow live matches and trade in real-time</p>
            </div>
          </button>

          {/* Players Card */}
          <button
            onClick={() => navigate('/player/1')}
            className="group relative p-8 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-accent/50 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent to-accent/50 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Players</h3>
              <p className="text-gray-400">Discover and trade promising football talents</p>
            </div>
          </button>

          {/* Market Card */}
          <button
            onClick={() => navigate('/clubs')}
            className="group relative p-8 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-[#D83F6A]/50 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D83F6A]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[#D83F6A] to-[#B91C4A] rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Market</h3>
              <p className="text-gray-400">Track market values and trading opportunities</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Teams', value: '500+' },
            { label: 'Players', value: '12K+' },
            { label: 'Leagues', value: '25+' },
            { label: 'Active Users', value: '1.2K' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 bg-dark-800/30 rounded-lg border border-dark-700 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
