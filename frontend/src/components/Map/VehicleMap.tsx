import { MapContainer, TileLayer } from 'react-leaflet';
import VehicleMarker from './VehicleMarker';
import { useState, useEffect } from 'react';
import RouteOverlay from './RouteOverlay';
import RouteControl from './RouteControl';
import io from 'socket.io-client';
import TourGuide from '../Tour/TourGuide';
import ProgressBar from '../Dashboard/ProgressBar';
import StatsPanel from '../Dashboard/StatsPanel';

export default function VehicleMap() {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [vehiclePos, setVehiclePos] = useState<[number, number]>([33.8958, -118.2208]);
  const [tourRun, setTourRun] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [vehiclePositions, setVehiclePositions] = useState<{ [id: string]: [number, number] }>({});
  const [snappedRoute, setSnappedRoute] = useState<[number, number][]>([]);
  const [snapping, setSnapping] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleStats, setVehicleStats] = useState<any>({});

  useEffect(() => {
    const socket = io('/vehicles', { path: '/socket.io' });
    socket.on('vehicle-update', (data: { id: string, lat: number, lng: number, progress?: number, speed?: number, battery?: number, eta?: string, status?: string }) => {
      setVehiclePositions(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
      setVehicleStats(prev => ({ ...prev, [data.id]: { ...prev[data.id], ...data } }));
    });
    return () => { socket.disconnect(); };
  }, []);

  function handleMapClick(e: any) {
    setRoute([...route, [e.latlng.lat, e.latlng.lng]]);
  }

  async function handleSnapRoute() {
    if (route.length < 2) return;
    setSnapping(true);
    const res = await fetch('/api/v1/vehicles/snap-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints: route })
    });
    const data = await res.json();
    setSnappedRoute(data.snapped || []);
    setSnapping(false);
  }

  async function handleSubmitRoute() {
    if (snappedRoute.length < 2) return;
    await fetch('/api/v1/vehicles/tesla-001/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints: snappedRoute })
    });
    setRoute([]);
    setSnappedRoute([]);
    setTourStep(3); // advance tour to vehicle driving
  }

  return (
    <>
      <TourGuide run={tourRun} stepIndex={tourStep} setStepIndex={setTourStep} />
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
        <RouteControl route={snappedRoute} onSubmit={handleSubmitRoute} />
        <button
          className="absolute top-20 left-4 z-10 bg-tesla-blue text-white px-4 py-2 rounded font-bold"
          onClick={handleSnapRoute}
          disabled={route.length < 2 || snapping}
        >
          {snapping ? 'Snapping...' : 'Snap to Road'}
        </button>
        <MapContainer
          center={[33.8958, -118.2208]}
          zoom={13}
          style={{ height: '100vh', width: '100vw' }}
          whenCreated={map => map.on('click', handleMapClick)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {Object.entries(vehiclePositions).map(([id, pos]) => (
            <div key={id} onClick={() => setSelectedVehicle(id)} style={{ cursor: 'pointer' }}>
              <VehicleMarker position={pos} id={id} />
              {selectedVehicle === id && (
                <ProgressBar progress={vehicleStats[id]?.progress || 0} />
              )}
            </div>
          ))}
          <StatsPanel stats={selectedVehicle ? vehicleStats[selectedVehicle] : null} />
          <RouteOverlay points={snappedRoute.length ? snappedRoute : route} />
        </MapContainer>
      </div>
    </>
  );
} 