import React from 'react';

async function callControl(id: string, action: string) {
  const res = await fetch(`/api/v1/vehicles/${id}/${action}`, { method: 'POST' });
  const data = await res.json();
  alert(data.message || 'Action sent!');
}

export default function AdvancedControls({ vehicleId, disabled }: { vehicleId: string, disabled?: boolean }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-tesla-gray text-white p-4 rounded shadow flex flex-col gap-2 min-w-[180px]">
      <div className="font-bold text-lg mb-2">Advanced Controls</div>
      <button className="bg-tesla-blue px-3 py-1 rounded font-bold" onClick={() => callControl(vehicleId, 'lock')} disabled={disabled}>Lock</button>
      <button className="bg-tesla-blue px-3 py-1 rounded font-bold" onClick={() => callControl(vehicleId, 'unlock')} disabled={disabled}>Unlock</button>
      <button className="bg-tesla-red px-3 py-1 rounded font-bold" onClick={() => callControl(vehicleId, 'stop')} disabled={disabled}>Emergency Stop</button>
      <button className="bg-tesla-gray border border-tesla-blue px-3 py-1 rounded font-bold" onClick={() => callControl(vehicleId, 'reroute')} disabled={disabled}>Reroute</button>
    </div>
  );
} 