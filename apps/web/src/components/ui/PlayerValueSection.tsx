import React from 'react';
import { Card } from './Card';
import { PlayerValue } from '@/types/player';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerValueSectionProps {
  valueHistory: PlayerValue[];
}

export const PlayerValueSection: React.FC<PlayerValueSectionProps> = ({ valueHistory }) => {
  const currentValue = valueHistory[valueHistory.length - 1].value;
  const previousValue = valueHistory[valueHistory.length - 2].value;
  const valueChange = currentValue - previousValue;
  const valueChangePercent = ((valueChange / previousValue) * 100).toFixed(1);
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };
  
  return (
    <Card title="Market Value">
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">
            {formatValue(currentValue)}
          </span>
          <span className={`text-lg font-semibold ${valueChange >= 0 ? 'text-secondary' : 'text-danger'}`}>
            {valueChange >= 0 ? '↗' : '↘'} {valueChangePercent}%
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">Current market value</p>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={valueHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), 'Value']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#colorGradient)" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#10B981' }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button className="flex-1 bg-gradient-to-r from-secondary to-emerald-600 hover:from-secondary/90 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-secondary/25 hover:shadow-secondary/50 hover:scale-[1.02] flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Buy Player</span>
        </button>
        
        <button className="btn-sell flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-red-600/30 hover:shadow-red-500/50 hover:scale-[1.02] flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sell Player</span>
        </button>
      </div>
    </Card>
  );
};
