import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import FleetVehiclesPanel from '../components/Dashboard/FleetVehiclesPanel';

const Map = dynamic(() => import('../components/Map/VehicleMap'), { ssr: false });

export default function Home() {
  // Pending riders placeholder (empty array for now)
  const pendingRiders: any[] = [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-tesla-black relative">
      {/* Left UI Panel (empty for now) */}
      <div className="absolute left-0 top-0 bottom-0 w-72 p-4 z-50 flex flex-col">
        {/* ...your left panel content... */}
      </div>
      {/* Centered Map Window */}
      <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800 bg-white"
           style={{ width: 900, height: 700 }}>
        <Map />
      </div>
      {/* Right UI Panel: Fleet Vehicles and Pending Riders */}
      <div className="absolute right-0 top-0 bottom-0 w-72 p-4 z-50 flex flex-col space-y-4">
        {/* FleetVehiclesPanel and Pending Riders will be handled by VehicleMap or other debug route logic */}
      </div>
    </div>
  );
} 