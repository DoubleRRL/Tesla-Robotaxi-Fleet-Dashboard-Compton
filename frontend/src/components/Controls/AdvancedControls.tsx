import React from 'react';

interface AdvancedControlsProps {
  vehicleId: string;
  disabled: boolean;
}

export default function AdvancedControls({ vehicleId, disabled }: AdvancedControlsProps) {
  const controls = [
    {
      id: 'lock',
      label: 'Lock',
      description: 'Remotely lock all doors and disable entry',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        if (!vehicleId) {
          alert('Please select a vehicle first');
          return;
        }
        fetch(`/api/v1/vehicles/${vehicleId}/lock`, { method: 'POST' })
          .then(res => res.json())
          .then(data => alert(`Vehicle ${vehicleId} locked: ${data.message}`))
          .catch(err => alert(`Error: ${err.message}`));
      }
    },
    {
      id: 'unlock',
      label: 'Unlock',
      description: 'Remotely unlock all doors for passenger entry',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        if (!vehicleId) {
          alert('Please select a vehicle first');
          return;
        }
        fetch(`/api/v1/vehicles/${vehicleId}/unlock`, { method: 'POST' })
          .then(res => res.json())
          .then(data => alert(`Vehicle ${vehicleId} unlocked: ${data.message}`))
          .catch(err => alert(`Error: ${err.message}`));
      }
    },
    {
      id: 'stop',
      label: 'Emergency Stop',
      description: 'Immediately stop vehicle and engage safety systems',
      color: 'bg-red-600 hover:bg-red-700',
      action: () => {
        if (!vehicleId) {
          alert('Please select a vehicle first');
          return;
        }
        if (confirm('Are you sure you want to emergency stop this vehicle?')) {
          fetch(`/api/v1/vehicles/${vehicleId}/stop`, { method: 'POST' })
            .then(res => res.json())
            .then(data => alert(`Vehicle ${vehicleId} emergency stopped: ${data.message}`))
            .catch(err => alert(`Error: ${err.message}`));
        }
      }
    },
    {
      id: 'reroute',
      label: 'Reroute',
      description: 'Cancel current route and return to available status',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        if (!vehicleId) {
          alert('Please select a vehicle first');
          return;
        }
        if (confirm('Are you sure you want to cancel the current route?')) {
          fetch(`/api/v1/vehicles/${vehicleId}/reroute`, { method: 'POST' })
            .then(res => res.json())
            .then(data => alert(`Vehicle ${vehicleId} rerouted: ${data.message}`))
            .catch(err => alert(`Error: ${err.message}`));
        }
      }
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold mb-3">Advanced Controls</h3>
      {!vehicleId && (
        <p className="text-gray-400 text-sm mb-3">
          Select a vehicle to enable controls
        </p>
      )}
      {controls.map(control => (
        <div key={control.id} className="space-y-1">
          <button
            onClick={control.action}
            disabled={disabled}
            className={`w-full ${control.color} text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {control.label}
          </button>
          <p className="text-gray-400 text-xs">
            {control.description}
          </p>
        </div>
      ))}
    </div>
  );
} 