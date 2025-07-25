import React from 'react';

export default function SurgePanel({ inUse, total }: { inUse: number, total: number }) {
  let surge = 1.0;
  const pct = inUse / total;
  if (pct === 0) surge = 1.0;
  else if (pct <= 0.5) surge = 1.2 + pct * 0.6; // 1.2x-1.5x
  else surge = 1.5 + (pct - 0.5) * 2.0; // 1.5x-2.5x
  surge = Math.round(surge * 100) / 100;
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-tesla-gray text-white p-4 rounded shadow min-w-[180px]">
      <div className="font-bold text-lg mb-2">Surge Pricing</div>
      <div>In Use: {inUse} / {total}</div>
      <div>Multiplier: <span className="text-tesla-red font-bold">{surge}x</span></div>
    </div>
  );
} 