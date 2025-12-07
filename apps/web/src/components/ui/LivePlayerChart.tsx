import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LivePlayerChartProps {
  data: { time: string; value: number }[];
  playerName: string;
}

export function LivePlayerChart({ data, playerName }: LivePlayerChartProps) {
  const formatValue = (value: number) => {
    return `€${(value / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="time"
            stroke="#64748B"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#94A3B8' }}
          />
          <YAxis
            stroke="#64748B"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#94A3B8' }}
            tickFormatter={formatValue}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '8px',
              padding: '8px'
            }}
            labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
            itemStyle={{ color: '#10B981' }}
            formatter={(value: number) => [formatValue(value), 'Valeur']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 3 }}
            activeDot={{ r: 5, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
