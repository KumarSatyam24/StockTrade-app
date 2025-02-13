import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyPrice } from '../services/priceHistory';

interface PriceHistoryChartProps {
  data: DailyPrice[];
  height?: number;
}

export function PriceHistoryChart({ data, height = 300 }: PriceHistoryChartProps) {
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const priceChange = sortedData.length >= 2
    ? ((sortedData[sortedData.length - 1].close_price - sortedData[0].close_price) / sortedData[0].close_price) * 100
    : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {sortedData[0]?.date} - {sortedData[sortedData.length - 1]?.date}
        </div>
        <div className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </div>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis 
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${value.toFixed(2)}`}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="close_price" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}