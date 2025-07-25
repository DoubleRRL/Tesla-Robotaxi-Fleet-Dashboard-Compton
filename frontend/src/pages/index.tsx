import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const Map = dynamic(() => import('../components/Map/VehicleMap'), { ssr: false });

export default function Home() {
  return (
    <div className="h-screen w-screen bg-tesla-black">
      <Map />
    </div>
  );
} 