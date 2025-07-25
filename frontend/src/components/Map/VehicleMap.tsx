import { MapContainer, TileLayer } from 'react-leaflet';
import VehicleMarker from './VehicleMarker';
import { useState, useEffect } from 'react';
import RouteOverlay from './RouteOverlay';
import RouteControl from './RouteControl';
import io from 'socket.io-client';
import TourGuide from '../Tour/TourGuide';
import ProgressBar from '../Dashboard/ProgressBar';
import StatsPanel from '../Dashboard/StatsPanel';
import SurgePanel from '../Analytics/SurgePanel';
import AdvancedControls from '../Controls/AdvancedControls';
import AnalyticsPanel from '../Analytics/AnalyticsPanel';

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
  const [availableBadges, setAvailableBadges] = useState<{ [id: string]: boolean }>({});
  const [pullOverAlert, setPullOverAlert] = useState<any>(null);
  const [pullOverVehicles, setPullOverVehicles] = useState<{ [id: string]: boolean }>({});

  const analyticsStats = {
    utilization: Math.round((Object.values(vehicleStats).filter(v => v?.status === 'occupied').length / Math.max(1, Object.keys(vehicleStats).length)) * 100),
    avgTrip: 12 + Math.round(Math.random() * 8),
    revenue: 1200 + Math.round(Math.random() * 500),
    surgeHistory: [1.0, 1.2, 1.5, 2.0, 1.7],
    charging: Object.values(vehicleStats).filter(v => v?.status === 'charging').length
  };

  useEffect(() => {
    const socket = io('/vehicles', { path: '/socket.io' });
    socket.on('vehicle-update', (data: { id: string, lat: number, lng: number, progress?: number, speed?: number, battery?: number, eta?: string, status?: string }) => {
      setVehiclePositions(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
      setVehicleStats(prev => ({ ...prev, [data.id]: { ...prev[data.id], ...data } }));
      if (data.status === 'available') {
        setAvailableBadges(prev => ({ ...prev, [data.id]: true }));
        setTimeout(() => setAvailableBadges(prev => ({ ...prev, [data.id]: false })), 4000);
      }
    });
    socket.on('pull-over-alert', (rideData: any) => {
      setPullOverAlert(rideData);
      setPullOverVehicles(prev => ({ ...prev, [rideData.id]: true }));
      setTimeout(() => setPullOverVehicles(prev => ({ ...prev, [rideData.id]: false })), 10000);
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
    setTourStep(3); // advance tour to send route
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
    setTourStep(4); // advance tour to vehicle driving
  }

  return (
    <>
      <TourGuide run={tourRun} stepIndex={tourStep} setStepIndex={setTourStep} />
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
        <RouteControl route={snappedRoute} onSubmit={handleSubmitRoute} />
        <button
          className="snap-to-road-btn absolute top-20 left-4 z-10 bg-tesla-blue text-white px-4 py-2 rounded font-bold"
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
            <div key={id} onClick={() => setSelectedVehicle(id)} style={{ cursor: 'pointer', position: 'relative' }}>
              <VehicleMarker position={pos} id={id} color={pullOverVehicles[id] ? 'orange' : undefined} />
              {selectedVehicle === id && (
                <ProgressBar progress={vehicleStats[id]?.progress || 0} />
              )}
              {availableBadges[id] && (
                <span className="absolute left-8 top-0 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-bounce">available</span>
              )}
            </div>
          ))}
          {pullOverAlert && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white text-black p-6 rounded shadow-xl max-w-md w-full">
                <div className="font-bold text-lg mb-2 text-tesla-red">Rider Pull-Over Alert</div>
                <div className="mb-2">Vehicle: {pullOverAlert.id}</div>
                <div className="mb-2">Time: {new Date(pullOverAlert.timestamp).toLocaleString()}</div>
                <div className="mb-2">Reason: {pullOverAlert.reason}</div>
                <div className="mb-2">Route: {JSON.stringify(pullOverAlert.route)}</div>
                <div className="mb-2">Video: <span className="bg-tesla-gray text-white px-2 py-1 rounded">placeholder.mp4</span></div>
                <button className="bg-tesla-blue text-white px-4 py-2 rounded font-bold mt-2" onClick={() => setPullOverAlert(null)}>Close</button>
                <button className="bg-tesla-red text-white px-4 py-2 rounded font-bold mt-2 ml-2">Review in Dojo2</button>
              </div>
            </div>
          )}
          <StatsPanel stats={selectedVehicle ? vehicleStats[selectedVehicle] : null} />
          <SurgePanel inUse={Object.values(vehicleStats).filter(v => v?.status === 'occupied').length} total={Object.keys(vehicleStats).length} />
          <AnalyticsPanel stats={analyticsStats} />
          <AdvancedControls
            vehicleId={selectedVehicle || ''}
            disabled={!selectedVehicle}
          />
          <RouteOverlay points={snappedRoute.length ? snappedRoute : route} />
        </MapContainer>
      </div>
    </>
  );
} 