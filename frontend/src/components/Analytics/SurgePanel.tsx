import React from 'react';

interface SurgePanelProps {
  inUse: number;
  total: number;
}

export default function SurgePanel({ inUse, total }: SurgePanelProps) {
  const utilization = total > 0 ? (inUse / total) * 100 : 0;
  const multiplier = utilization > 80 ? 2.0 : utilization > 60 ? 1.5 : utilization > 40 ? 1.2 : 1.0;

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-sm">Surge Pricing</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-300">In Use:</span>
          <span className="text-white font-semibold">{inUse} / {total}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Multiplier:</span>
          <span className={`font-bold ${multiplier > 1.5 ? 'text-red-400' : multiplier > 1.2 ? 'text-yellow-400' : 'text-green-400'}`}>
            {multiplier.toFixed(1)}x
          </span>
        </div>
        
        <div className="w-full bg-tesla-black rounded-full h-2">
          <div 
            className="bg-tesla-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${utilization}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 