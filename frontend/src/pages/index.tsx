import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const Map = dynamic(() => import('../components/Map/VehicleMap'), { ssr: false });

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map always at the bottom layer */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>
      {/* Example UI panel, always on top */}
      <div className="absolute top-4 left-4 z-50 bg-white bg-opacity-90 rounded shadow p-4">
        <h2 className="font-bold text-lg">Fleet Dashboard Panel</h2>
        {/* Add your real UI here */}
      </div>
    </div>
  );
} 