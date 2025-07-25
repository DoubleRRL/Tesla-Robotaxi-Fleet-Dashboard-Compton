import React from 'react';

export default function RouteControl({ route, onSubmit }: { route: [number, number][], onSubmit: () => void }) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-tesla-gray p-4 rounded shadow">
      <button
        className="route-control-btn bg-tesla-red text-white px-4 py-2 rounded font-bold hover:bg-tesla-blue"
        onClick={onSubmit}
        disabled={route.length < 2}
      >
        Send Route
      </button>
    </div>
  );
} 