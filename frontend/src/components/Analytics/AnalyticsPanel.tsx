import React from 'react';

interface AnalyticsPanelProps {
  stats: {
    utilization: number;
    avgTrip: number;
    revenue: number;
    surgeHistory: number[];
    charging: number;
  };
}

export default function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-sm">Fleet Analytics</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-300">Utilization:</span>
          <span className="text-white font-semibold">{stats.utilization}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Avg Trip Time:</span>
          <span className="text-white font-semibold">{stats.avgTrip} min</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Revenue:</span>
          <span className="text-white font-semibold">${stats.revenue}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Charging:</span>
          <span className="text-white font-semibold">{stats.charging} vehicles</span>
        </div>
        
        <div className="mt-2">
          <span className="text-gray-300 text-xs">Surge History:</span>
          <div className="flex gap-1 mt-1">
            {stats.surgeHistory.map((value, index) => (
              <span 
                key={index} 
                className="bg-tesla-blue text-white px-1 py-0.5 rounded text-xs font-bold"
              >
                {value}x
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 