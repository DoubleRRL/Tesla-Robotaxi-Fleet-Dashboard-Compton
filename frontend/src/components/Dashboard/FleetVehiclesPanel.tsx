import React from 'react';

interface VehicleData {
  id: string;
  status?: string;
  battery?: number;
  speed?: number;
  eta?: string;
}

interface FleetVehiclesPanelProps {
  vehicles: { [id: string]: VehicleData };
}

export default function FleetVehiclesPanel({ vehicles }: FleetVehiclesPanelProps) {
  const getVehicleType = (id: string) => {
    if (id.includes('cybertruck')) return 'cybertruck';
    if (id.includes('modelx')) return 'modelx';
    if (id.includes('modely')) return 'modely';
    return 'tesla'; // fallback
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'idle':
        return 'text-green-400';
      case 'en route':
      case 'pickup':
        return 'text-blue-400';
      case 'occupied':
      case 'dropoff':
        return 'text-yellow-400';
      case 'charging':
        return 'text-orange-400';
      case 'pull-over':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
      case 'idle':
        return '🟢';
      case 'en route':
      case 'pickup':
        return '🔵';
      case 'occupied':
      case 'dropoff':
        return '🟡';
      case 'charging':
        return '🔌';
      case 'pull-over':
        return '🛑';
      default:
        return '⚪';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'cybertruck':
        return '/cybertruck.png';
      case 'modelx':
        return '/model x.png';
      case 'modely':
        return '/model y.png';
      default:
        return '/tesla.png';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'en route':
        return 'En Route to Pickup';
      case 'occupied':
        return 'Dropoff in Progress';
      case 'available':
        return 'Idle - Available';
      case 'charging':
        return 'Charging';
      case 'pull-over':
        return 'Pull Over';
      default:
        return status || 'Unknown';
    }
  };

  const vehicleIds = Object.keys(vehicles).sort();

  return (
    <div className="bg-tesla-gray rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-3">Fleet Vehicles</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {vehicleIds.length > 0 ? (
          vehicleIds.map(id => {
            const vehicle = vehicles[id];
            const vehicleType = getVehicleType(id);
            const status = vehicle?.status || 'unknown';
            
            return (
              <div key={id} className="flex items-center space-x-2 p-2 bg-tesla-black rounded text-xs">
                {/* Vehicle Icon */}
                <div className="flex-shrink-0">
                  <img 
                    src={getVehicleIcon(vehicleType)} 
                    alt={vehicleType}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).style.display = 'block';
                    }}
                  />
                  <span className="hidden text-white font-bold text-xs">
                    {vehicleType === 'cybertruck' ? 'CT' : 
                     vehicleType === 'modelx' ? 'X' : 
                     vehicleType === 'modely' ? 'Y' : 'T'}
                  </span>
                </div>
                
                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-white font-semibold truncate">{id}</span>
                    <span className={getStatusColor(status)}>{getStatusIcon(status)}</span>
                  </div>
                  <div className="text-gray-400 truncate">
                    {formatStatus(status)}
                  </div>
                </div>
                
                {/* Vehicle Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-white">
                    {vehicle?.battery || 'N/A'}%
                  </div>
                  <div className="text-gray-400">
                    {vehicle?.speed || 0} mph
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-xs text-center py-4">
            No vehicles connected
          </div>
        )}
      </div>
    </div>
  );
} 