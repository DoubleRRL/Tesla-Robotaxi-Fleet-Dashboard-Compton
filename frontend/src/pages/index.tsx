import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import FleetVehiclesPanel from '../components/Dashboard/FleetVehiclesPanel';
import { useFleetState } from '../hooks/useFleetState';

const Map = dynamic(() => import('../components/Map/VehicleMap'), { ssr: false });

export default function Home() {
  const { 
    vehicles, 
    selectedVehicle, 
    socketConnected,
    selectVehicle,
    sendRouteToVehicle,
    sendEmergencyStop,
    sendLockVehicle,
    sendUnlockVehicle,
    refreshAllVehicles
  } = useFleetState();
  
  // Convert vehicles array to object keyed by id for FleetVehiclesPanel
  const vehiclesObj: { [id: string]: any } = {};
  vehicles.forEach(v => { vehiclesObj[v.id] = v; });
  
  // Pending riders placeholder (empty array for now)
  const pendingRiders: any[] = [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-tesla-black relative p-4">
      {/* Left UI Panel (empty for now) */}
      <div className="absolute left-4 top-4 bottom-4 w-80 z-50 flex flex-col bg-gray-900 bg-opacity-90 rounded-lg p-4">
        <h2 className="text-white text-lg font-bold mb-4">Control Panel</h2>
        <div className="text-gray-300 text-sm">
          <p>Left panel content coming soon...</p>
        </div>
      </div>
      {/* Centered Map Window */}
      <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800 bg-white"
           style={{ width: 1000, height: 750 }}>
        <Map 
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          socketConnected={socketConnected}
          onSelectVehicle={selectVehicle}
          onSendRoute={sendRouteToVehicle}
          onEmergencyStop={sendEmergencyStop}
          onLockVehicle={sendLockVehicle}
          onUnlockVehicle={sendUnlockVehicle}
          onRefreshVehicles={refreshAllVehicles}
        />
      </div>
      {/* Right UI Panel: Fleet Vehicles and Pending Riders */}
      <div className="absolute right-4 top-4 bottom-4 w-80 z-50 flex flex-col space-y-4">
        <FleetVehiclesPanel vehicles={vehiclesObj} pendingRiders={pendingRiders} />
      </div>
    </div>
  );
} 