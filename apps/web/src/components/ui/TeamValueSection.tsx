import React from 'react';
import { Card } from './Card';
import { TeamValue } from '@/types/team';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamValueSectionProps {
  valueHistory: TeamValue[];
}

export const TeamValueSection: React.FC<TeamValueSectionProps> = ({ valueHistory }) => {
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
    <Card title="Total Market Value">
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">
            {formatValue(currentValue)}
          </span>
          <span className={`text-lg font-semibold ${valueChange >= 0 ? 'text-secondary' : 'text-danger'}`}>
            {valueChange >= 0 ? '↗' : '↘'} {valueChangePercent}%
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">Squad portfolio value</p>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={valueHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), 'Value']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#teamColorGradient)" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#10B981' }}
            />
            <defs>
              <linearGradient id="teamColorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-dark-800/30 rounded-lg border border-dark-700">
        <p className="text-sm text-gray-400">
          💡 <span className="font-medium">Portfolio View:</span> Total market value represents the combined worth of all players in the squad, tracking the team's overall investment value over time.
        </p>
      </div>
    </Card>
  );
};
