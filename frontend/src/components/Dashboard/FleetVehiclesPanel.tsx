import React from 'react';

interface VehicleData {
  id: string;
  status?: string;
  battery?: number;
  speed?: number;
  eta?: string;
  destination?: [number, number];
  pickupLocation?: [number, number];
  progress?: number;
  route?: [number, number][];
}

interface FleetVehiclesPanelProps {
  vehicles: { [id: string]: VehicleData };
  pendingRiders: Array<{
    id: string;
    assignedVehicle?: string;
  }>;
}

export default function FleetVehiclesPanel({ vehicles, pendingRiders }: FleetVehiclesPanelProps) {
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
        return '/assets/images/cybertruck.png';
      case 'modelx':
        return '/assets/images/model x.png';
      case 'modely':
        return '/assets/images/model y.png';
      default:
        return '/assets/images/tesla.png';
    }
  };

  const formatStatus = (status: string, vehicle: VehicleData) => {
    switch (status) {
      case 'en route':
        return vehicle.pickupLocation ? 'En Route to Pickup' : 'En Route';
      case 'picking up':
        return 'Picking Up Rider';
      case 'occupied':
        return vehicle.destination ? 'En Route to Destination' : 'Dropoff in Progress';
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

  const getDestinationInfo = (vehicle: VehicleData) => {
    if (vehicle.status === 'en route' && vehicle.pickupLocation) {
      return `Pickup: ${vehicle.eta || 'N/A'}`;
    }
    if (vehicle.status === 'occupied' && vehicle.destination) {
      return `Destination: ${vehicle.eta || 'N/A'}`;
    }
    if (vehicle.status === 'picking up') {
      return `Pickup in progress`;
    }
    return '';
  };

  const isVehicleAssigned = (vehicleId: string, pendingRiders: any[]) => {
    return pendingRiders.some(rider => rider.assignedVehicle === vehicleId);
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
                    {formatStatus(status, vehicle)}
                  </div>
                  {getDestinationInfo(vehicle) && (
                    <div className="text-blue-400 truncate text-xs">
                      {getDestinationInfo(vehicle)}
                    </div>
                  )}
                  {vehicle?.route && vehicle.route.length > 0 && (
                    <div className="text-green-400 truncate text-xs">
                      🛣️ Route: {vehicle.route.length} waypoints
                    </div>
                  )}
                  {isVehicleAssigned(id, pendingRiders) && (
                    <div className="text-yellow-400 truncate text-xs">
                      🎯 Assigned to rider
                    </div>
                  )}
                </div>
                
                {/* Vehicle Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-white">
                    {vehicle?.battery || 'N/A'}%
                  </div>
                  <div className="text-green-400 font-bold">
                    {vehicle?.speed || 0} MPH 🇺🇸
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