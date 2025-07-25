import React from 'react';

export default function AnalyticsPanel({ stats }: { stats: any }) {
  if (!stats) return null;
  return (
    <div className="absolute top-24 right-4 z-10 bg-tesla-gray text-white p-4 rounded shadow min-w-[220px]">
      <div className="font-bold text-lg mb-2">Fleet Analytics</div>
      <div>Utilization: {stats.utilization}%</div>
      <div>Avg Trip Time: {stats.avgTrip} min</div>
      <div>Revenue: ${stats.revenue}</div>
      <div>Surge History: {stats.surgeHistory.join(', ')}x</div>
      <div>Charging: {stats.charging} vehicles</div>
    </div>
  );
} 