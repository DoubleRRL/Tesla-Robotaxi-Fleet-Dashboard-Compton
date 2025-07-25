import React from 'react';

export default function StatsPanel({ stats }: { stats: any }) {
  if (!stats) return null;
  return (
    <div className="stats-panel absolute top-4 right-4 z-10 bg-tesla-gray text-white p-4 rounded shadow min-w-[220px]">
      <div className="font-bold text-lg mb-2">Vehicle Stats</div>
      <div>ID: {stats.id}</div>
      <div>Status: {stats.status}</div>
      <div>Speed: {stats.speed} km/h</div>
      <div>Battery: {stats.battery}%</div>
      <div>ETA: {stats.eta}</div>
      <div>Progress: {stats.progress}%</div>
    </div>
  );
} 