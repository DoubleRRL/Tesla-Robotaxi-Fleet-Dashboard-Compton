import React from 'react';
import { VehicleContext } from '../../machines/vehicleMachine';

interface AdvancedControlsProps {
  selectedVehicle: VehicleContext | null;
  onEmergencyStop: (vehicleId: string) => void;
  onLockVehicle: (vehicleId: string) => void;
  onUnlockVehicle: (vehicleId: string) => void;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  selectedVehicle,
  onEmergencyStop,
  onLockVehicle,
  onUnlockVehicle
}) => {
  const controls = [
    {
      id: 'emergency-stop',
      label: '🚨 Emergency Stop',
      description: 'Immediately stop the vehicle',
      color: 'bg-red-600 hover:bg-red-700',
      action: () => selectedVehicle && onEmergencyStop(selectedVehicle.id)
    },
    {
      id: 'lock',
      label: '🔒 Lock Vehicle',
      description: 'Lock all doors and disable access',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: () => selectedVehicle && onLockVehicle(selectedVehicle.id)
    },
    {
      id: 'unlock',
      label: '🔓 Unlock Vehicle',
      description: 'Unlock doors and enable access',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => selectedVehicle && onUnlockVehicle(selectedVehicle.id)
    }
  ];

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-white font-bold mb-3">Advanced Controls</h3>
      
      {!selectedVehicle ? (
        <div className="bg-yellow-600 text-white p-3 rounded text-sm mb-3">
          ⚠️ Select a vehicle to enable advanced controls
        </div>
      ) : (
        <div className="mb-3 p-2 bg-gray-700 rounded text-xs">
          <strong>Selected:</strong> {selectedVehicle.id}
          <br />
          <strong>Status:</strong> {selectedVehicle.status}
          <br />
          <strong>Battery:</strong> {selectedVehicle.battery}%
          <br />
          <strong>Speed:</strong> {selectedVehicle.speed} mph
        </div>
      )}
      
      {controls.map(control => (
        <div key={control.id} className="space-y-1 mb-3">
          <button
            onClick={control.action}
            disabled={!selectedVehicle}
            className={`w-full ${control.color} text-white px-3 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
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
};

export default AdvancedControls; 