import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import io from 'socket.io-client';
import VehicleMarker from './VehicleMarker';
import RouteOverlay from './RouteOverlay';
import RouteControl from './RouteControl';
import ProgressBar from '../Dashboard/ProgressBar';
import StatsPanel from '../Dashboard/StatsPanel';

import AdvancedControls from '../Controls/AdvancedControls';
import AnalyticsPanel from '../Analytics/AnalyticsPanel';
import ComptonBoundary from './ComptonBoundary';
import QuickTourPanel from '../Tour/QuickTourPanel';
import 'leaflet/dist/leaflet.css';

const MAP_CENTER = [33.8958, -118.2208];

export default function VehicleMap() {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [snappedRoute, setSnappedRoute] = useState<[number, number][]>([]);
  const [snapping, setSnapping] = useState(false);
  const [vehiclePositions, setVehiclePositions] = useState<{ [id: string]: [number, number] }>({});
  const [vehicleStats, setVehicleStats] = useState<any>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [availableBadges, setAvailableBadges] = useState<{ [id: string]: boolean }>({});
  const [pullOverAlert, setPullOverAlert] = useState<any>(null);
  const [pullOverVehicles, setPullOverVehicles] = useState<{ [id: string]: boolean }>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [vehicleInfoOpen, setVehicleInfoOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  const analyticsStats = {
    utilization: Math.round((Object.values(vehicleStats).filter((v: any) => v?.status === 'occupied').length / Math.max(1, Object.keys(vehicleStats).length)) * 100),
    avgTrip: 12 + Math.round(Math.random() * 8),
    revenue: 1200 + Math.round(Math.random() * 500),
    charging: Object.values(vehicleStats).filter((v: any) => v?.status === 'charging').length,
    pendingRiders: Object.values(vehicleStats).filter((v: any) => v?.status === 'en route' || v?.status === 'occupied').length
  };

  useEffect(() => {
    const socketInstance = io('http://localhost:8000/vehicles');
    setSocket(socketInstance);
    
    socketInstance.on('connect', () => {
      console.log('Connected to backend');
      setSocketConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from backend');
      setSocketConnected(false);
    });
    
    socketInstance.on('vehicle-update', (data: { id: string, lat: number, lng: number, progress?: number, speed?: number, battery?: number, eta?: string, status?: string }) => {
      console.log('Vehicle update:', data);
      setVehiclePositions((prev: any) => ({ ...prev, [data.id]: [data.lat, data.lng] }));
      setVehicleStats((prev: any) => ({ ...prev, [data.id]: { ...prev[data.id], ...data } }));
      if (data.status === 'available') {
        setAvailableBadges((prev: any) => ({ ...prev, [data.id]: true }));
        setTimeout(() => setAvailableBadges((prev: any) => ({ ...prev, [data.id]: false })), 4000);
      }
    });
    
    socketInstance.on('pull-over-alert', (rideData: any) => {
      setPullOverAlert(rideData);
      setPullOverVehicles((prev: any) => ({ ...prev, [rideData.id]: true }));
      setTimeout(() => setPullOverVehicles((prev: any) => ({ ...prev, [rideData.id]: false })), 10000);
    });
    
    return () => { socketInstance.disconnect(); };
  }, []);

  function handleMapClick(e: any) {
    setRoute([...route, [e.latlng.lat, e.latlng.lng]]);
  }

  async function handleSnapRoute() {
    if (route.length < 2) {
      alert('Please draw at least 2 waypoints on the map first');
      return;
    }
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    
    setSnapping(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/vehicles/snap-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints: route })
      });
      const data = await res.json();
      
      if (data.error) {
        alert(`Route snapping failed: ${data.error}`);
        return;
      }
      
      setSnappedRoute(data.snapped || []);
      
      // Check battery for the route
      const vehicle = vehicleStats[selectedVehicle];
      if (vehicle && vehicle.battery) {
        const routeDistance = calculateRouteDistance(data.snapped);
        const batteryNeeded = routeDistance * 0.1; // rough estimate: 0.1% per km
        
        if (vehicle.battery < batteryNeeded) {
          alert(`Warning: Vehicle ${selectedVehicle} has ${vehicle.battery}% battery but needs ~${batteryNeeded.toFixed(1)}% for this route. Consider charging first.`);
        }
      }
      
    } catch (error) {
      alert('Failed to snap route. Please try again.');
    } finally {
      setSnapping(false);
    }
  }

  function calculateRouteDistance(coordinates: [number, number][]) {
    let distance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const [lat1, lng1] = coordinates[i - 1];
      const [lat2, lng2] = coordinates[i];
      distance += getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2);
    }
    return distance;
  }

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  async function handleSubmitRoute() {
    const routeToSubmit = snappedRoute.length > 0 ? snappedRoute : route;
    if (routeToSubmit.length < 2) {
      alert('Please draw at least 2 waypoints on the map first');
      return;
    }
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    
    try {
      // Send manual route directly to the vehicle via socket
      if (socket) {
        socket.emit('manual-route', {
          id: selectedVehicle,
          waypoints: routeToSubmit
        });
        console.log(`Manual route sent to ${selectedVehicle}:`, routeToSubmit);
        
        // Clear the route after sending
        setRoute([]);
        setSnappedRoute([]);
        
        alert(`Route pushed to ${selectedVehicle}. Use "Return to Original Route" to restore original path.`);
      } else {
        alert('Socket connection not available');
      }
    } catch (error) {
      alert('Error submitting route');
    }
  }

  function handleVehicleSelect(vehicleId: string) {
    setSelectedVehicle(vehicleId);
    setVehicleInfoOpen(true);
    setDropdownOpen(false);
  }

  const vehicleIds = Object.keys(vehiclePositions);
  const selectedVehicleStats = selectedVehicle ? vehicleStats[selectedVehicle] : null;

  return (
    <div className="min-h-screen bg-tesla-black p-4">
      <QuickTourPanel isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      
      {/* Debug info */}
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white p-2 rounded text-xs">
        Socket: {socketConnected ? 'Connected' : 'Disconnected'}
        <br />
        Vehicles: {vehicleIds.length}
      </div>
      
      <div className="grid grid-cols-12 gap-4 h-screen">
        {/* Left sidebar */}
        <div className="col-span-2 space-y-4">
          {/* Vehicle dropdown */}
          <div className="bg-tesla-gray rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Vehicles</h3>
            <button
              className="w-full bg-tesla-black text-white px-3 py-2 rounded font-bold text-sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedVehicle ? selectedVehicle : 'Select Vehicle'} ▼
            </button>
            {dropdownOpen && (
              <div className="bg-tesla-black text-white mt-2 rounded shadow-lg max-h-40 overflow-y-auto text-xs">
                {vehicleIds.map(id => (
                  <div
                    key={id}
                    className="px-3 py-2 hover:bg-tesla-blue cursor-pointer"
                    onClick={() => handleVehicleSelect(id)}
                  >
                    {id}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Vehicle-specific route controls */}
          {selectedVehicle ? (
            <div className="bg-tesla-gray rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">Route Management - {selectedVehicle}</h3>
              <p className="text-gray-400 text-xs mb-2">
                Click map to draw waypoints, then snap to roads
              </p>
              <RouteControl route={snappedRoute} onSubmit={handleSubmitRoute} />
              <div className="space-y-2 mt-2">
                <button
                  className="w-full bg-tesla-blue text-white px-3 py-2 rounded font-bold text-sm"
                  onClick={handleSnapRoute}
                  disabled={route.length < 2 || snapping}
                >
                  {snapping ? 'Snapping...' : 'Snap to Road'}
                </button>
                <button
                  className="w-full bg-yellow-600 text-white px-3 py-2 rounded font-bold text-sm"
                  onClick={() => {
                    // Send command to return to original route
                    if (socket) {
                      socket.emit('control', { id: selectedVehicle, action: 'return-to-original' });
                      console.log(`Return to original route command sent to ${selectedVehicle}`);
                    }
                  }}
                >
                  Return to Original Route
                </button>
                <button
                  className="w-full bg-tesla-black text-white px-3 py-2 rounded font-bold text-sm"
                  onClick={() => setRoute([])}
                >
                  Clear Route
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <p>• Vehicle will return to original route after manual intervention</p>
                <p>• Use for emergency rerouting when vehicle gets stuck</p>
              </div>
            </div>
          ) : (
            <div className="bg-tesla-gray rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">Route Management</h3>
              <p className="text-gray-400 text-xs">
                Select a vehicle to enable route management
              </p>
            </div>
          )}
          
          {/* Advanced controls */}
          <div className="bg-tesla-gray rounded-lg p-4">
            <AdvancedControls vehicleId={selectedVehicle || ''} disabled={!selectedVehicle} />
          </div>
          
                                {/* Help button */}
                      <div className="bg-tesla-gray rounded-lg p-4">
                        <button
                          onClick={() => setTourOpen(true)}
                          className="w-full bg-tesla-blue text-white px-3 py-2 rounded font-bold text-sm mb-2"
                        >
                          Quick Tour
                        </button>
                        <button
                          onClick={() => {
                            // Send refresh command to all vehicles
                            if (socket) {
                              socket.emit('refresh-all');
                              console.log('Refresh command sent to all vehicles');
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-bold text-sm"
                        >
                          Refresh All Vehicles
                        </button>
                      </div>
        </div>
        
        {/* Center map */}
        <div className="col-span-8">
          <div className="bg-tesla-gray rounded-lg p-4 h-full">
            <MapContainer
              center={MAP_CENTER}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
              className="bg-tesla-black"
              whenCreated={(map: any) => map.on('click', handleMapClick)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <ComptonBoundary />
              {Object.entries(vehiclePositions).map(([id, pos]) => {
                const vehicleData = vehicleStats[id] || {};
                const position = Array.isArray(pos) && pos.length === 2 ? [pos[0], pos[1]] as [number, number] : [0, 0] as [number, number];
                
                // Robust Compton boundary and street validation
                const [lat, lng] = position as [number, number];
                const isWithinCompton = lat >= 33.87442 && lat <= 33.92313 && lng >= -118.26315 && lng <= -118.17995;
                
                // Additional validation: ensure coordinates are valid numbers and within reasonable bounds
                const isValidPosition = !isNaN(lat) && !isNaN(lng) && 
                                       lat >= 33.8 && lat <= 34.0 && 
                                       lng >= -118.3 && lng <= -118.1;
                
                // Street validation: ensure vehicles are near major Compton streets
                const majorStreets = [
                  [33.9000, -118.2200], // Central Ave
                  [33.9000, -118.2100], // Atlantic Ave
                  [33.9000, -118.2000], // Long Beach Blvd
                  [33.9000, -118.1900], // Alameda St
                  [33.9000, -118.2400], // Compton Blvd
                  [33.9000, -118.2500], // Artesia Blvd
                  [33.9200, -118.2200], // Rosecrans Ave
                  [33.9100, -118.2200], // Compton Blvd
                  [33.8900, -118.2200], // Alondra Blvd
                  [33.8800, -118.2200]  // Artesia Blvd
                ];
                
                const isNearStreet = majorStreets.some(([streetLat, streetLng]) => {
                  const distance = Math.sqrt(
                    Math.pow(lat - streetLat, 2) + Math.pow(lng - streetLng, 2)
                  );
                  return distance < 0.005; // ~500m threshold for street proximity
                });
                
                if (!isWithinCompton || !isValidPosition || !isNearStreet) {
                  console.log(`Vehicle ${id} outside Compton bounds, invalid position, or not on street: ${lat}, ${lng}`);
                  return null; // Skip vehicles that don't meet all criteria
                }
                
                return (
                  <div key={id} onClick={() => handleVehicleSelect(id)} style={{ cursor: 'pointer', position: 'relative' }}>
                    <VehicleMarker 
                      position={position} 
                      id={id} 
                      color={pullOverVehicles[id] ? 'orange' : undefined}
                      speed={vehicleData.speed}
                      heading={vehicleData.heading}
                      status={vehicleData.status}
                    />
                    {selectedVehicle === id && (
                      <ProgressBar progress={vehicleData.progress || 0} />
                    )}
                    {availableBadges[id] && (
                      <span className="absolute left-8 top-0 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-bounce">available</span>
                    )}
                    {vehicleData.status === 'en route' && (
                      <span className="absolute left-8 top-0 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-pulse">pickup</span>
                    )}
                  </div>
                );
              })}
              <RouteOverlay points={snappedRoute.length ? snappedRoute : route} />
            </MapContainer>
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="col-span-2 space-y-4">
          {/* Stats panel */}
          <div className="bg-tesla-gray rounded-lg p-4">
            <StatsPanel stats={selectedVehicleStats} />
          </div>
          
          {/* Analytics panel */}
          <div className="bg-tesla-gray rounded-lg p-4">
            <AnalyticsPanel stats={analyticsStats} />
          </div>
          
          {/* Pending Riders panel */}
          <div className="bg-tesla-gray rounded-lg p-4">
            <h3 className="text-white font-bold text-sm mb-3">Pending Riders</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Waiting for Pickup:</span>
                <span className="text-white font-semibold">
                  {Object.values(vehicleStats).filter((v: any) => v?.status === 'en route').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">In Transit:</span>
                <span className="text-white font-semibold">
                  {Object.values(vehicleStats).filter((v: any) => v?.status === 'occupied').length}
                </span>
              </div>
              <div className="w-full bg-tesla-black rounded-full h-2 mt-2">
                <div
                  className="bg-tesla-blue h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.values(vehicleStats).filter((v: any) => v?.status === 'en route' || v?.status === 'occupied').length / Math.max(1, vehicleIds.length)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle info modal */}
      {vehicleInfoOpen && selectedVehicleStats && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-tesla-gray border-2 border-tesla-blue rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">Vehicle: {selectedVehicle}</h2>
              <button 
                onClick={() => setVehicleInfoOpen(false)}
                className="text-tesla-blue hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-white">
              <div>
                <span className="font-bold">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedVehicleStats.status === 'available' ? 'bg-green-600' :
                  selectedVehicleStats.status === 'occupied' ? 'bg-blue-600' :
                  selectedVehicleStats.status === 'charging' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}>
                  {selectedVehicleStats.status || 'Unknown'}
                </span>
              </div>
              <div><span className="font-bold">Battery:</span> {selectedVehicleStats.battery || 'N/A'}%</div>
              <div><span className="font-bold">Speed:</span> {selectedVehicleStats.speed || 'N/A'} mph</div>
              <div><span className="font-bold">ETA:</span> {selectedVehicleStats.eta || 'N/A'}</div>
              <div><span className="font-bold">Progress:</span> {selectedVehicleStats.progress || 'N/A'}%</div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setVehicleInfoOpen(false)}
                className="bg-tesla-black text-white px-4 py-2 rounded font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* pull-over alert modal */}
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
    </div>
  );
} 