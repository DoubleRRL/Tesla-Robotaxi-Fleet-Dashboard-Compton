import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useFleetState } from '../../hooks/useFleetState';
import AdvancedControls from '../Controls/AdvancedControls';
import RouteControl from '../Controls/RouteControl';
import ComptonBoundary from './ComptonBoundary';
import { VehicleContext } from '../../machines/vehicleMachine';

// Custom map events component
const MapEvents: React.FC<{ onMapClick: (event: any) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

// Map ready handler component
const MapReadyHandler: React.FC = () => {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (map) {
      // Store map reference globally for resize handler
      (window as any).map = map;
      
      // Force map to recalculate size and center
      setTimeout(() => {
        map.invalidateSize();
        map.setView([33.8958, -118.2208], 13);
      }, 100);
    }
  }, [map]);
  
  return null;
};

// Vehicle marker component
const VehicleMarker: React.FC<{
  vehicle: VehicleContext;
  isSelected: boolean;
  onClick: () => void;
}> = ({ vehicle, isSelected, onClick }) => {
  const getVehicleIcon = (type: string, status: string) => {
    const baseSize = 25;
    const color = status === 'occupied' ? 'red' : 
                  status === 'pickup' ? 'orange' : 
                  status === 'en route' ? 'blue' : 
                  status === 'pull-over' ? 'yellow' : 'green';
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="${baseSize}" height="${baseSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${type.charAt(0).toUpperCase()}</text>
        </svg>
      `)}`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
    });
  };

  const position: LatLngExpression = vehicle.position as [number, number];

  return (
    <Marker
      position={position}
      icon={getVehicleIcon(vehicle.type, vehicle.status)}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-bold">{vehicle.id}</h3>
          <p><strong>Type:</strong> {vehicle.type}</p>
          <p><strong>Status:</strong> {vehicle.status}</p>
          <p><strong>Battery:</strong> {vehicle.battery || 0}%</p>
          <p><strong>Speed:</strong> {vehicle.speed || 0} mph</p>
          <p><strong>ETA:</strong> {vehicle.eta || 'N/A'}</p>
          {vehicle.assignedRider && (
            <p><strong>Rider:</strong> {vehicle.assignedRider}</p>
          )}
          <hr className="my-2" />
          <p className="text-xs text-gray-500">Debug: Speed={JSON.stringify(vehicle.speed)}</p>
        </div>
      </Popup>
    </Marker>
  );
};

interface VehicleMapProps {
  vehicles: any[];
  selectedVehicle: any;
  socketConnected: boolean;
  onSelectVehicle: (vehicleId: string) => void;
  onSendRoute: (vehicleId: string, route: [number, number][]) => void;
  onEmergencyStop: (vehicleId: string) => void;
  onLockVehicle: (vehicleId: string) => void;
  onUnlockVehicle: (vehicleId: string) => void;
  onRefreshVehicles: () => void;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  vehicles,
  selectedVehicle,
  socketConnected,
  onSelectVehicle,
  onSendRoute,
  onEmergencyStop,
  onLockVehicle,
  onUnlockVehicle,
  onRefreshVehicles
}) => {

  // Robust debug logging
  useEffect(() => {
    console.log('--- VEHICLE DEBUG LOG ---');
    console.log('Vehicle count:', vehicles.length);
    vehicles.forEach((v, i) => {
      console.log(`#${i + 1}: id=${v.id}, position=${JSON.stringify(v.position)}, status=${v.status}`);
    });
    if (vehicles.length === 0) {
      console.warn('No vehicles found in frontend state!');
    }
  }, [vehicles]);

  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const mapRef = useRef<any>(null);

  // Handle map click for route drawing
  const handleMapClick = useCallback((event: any) => {
    if (isDrawingRoute && event.latlng) {
      const { lat, lng } = event.latlng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        setWaypoints(prev => [...prev, [lat, lng]]);
      }
    }
  }, [isDrawingRoute]);

  // Route management handlers
  const handleSendRoute = useCallback((vehicleId: string, route: [number, number][]) => {
    onSendRoute(vehicleId, route);
  }, [onSendRoute]);

  const handleClearRoute = useCallback((vehicleId: string) => {
    // Send empty route to clear current route
    onSendRoute(vehicleId, []);
  }, [onSendRoute]);

  const handleReturnToOriginal = useCallback((vehicleId: string) => {
    // This would typically restore the original route from backup
    // For now, we'll just clear the current route
    onSendRoute(vehicleId, []);
  }, [onSendRoute]);

  const handleStartDrawing = useCallback(() => {
    setIsDrawingRoute(true);
    setWaypoints([]);
  }, []);

  const handleStopDrawing = useCallback(() => {
    setIsDrawingRoute(false);
  }, []);

  const handleClearWaypoints = useCallback(() => {
    setWaypoints([]);
    setIsDrawingRoute(false);
  }, []);

  // Handle escape key to deselect vehicle
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedVehicle) {
        onSelectVehicle('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedVehicle, onSelectVehicle]);

  // On mount, store map instance and handle resize
  function MapReadyHandler() {
    const map = useMapEvents({});
    useEffect(() => {
      if (map) {
        mapRef.current = map;
        setTimeout(() => {
          map.invalidateSize();
          map.setView([33.8958, -118.2208], 13);
        }, 100);
      }
    }, [map]);
    return null;
  }

  useEffect(() => {
    function handleResize() {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
          mapRef.current.setView([33.8958, -118.2208], 13);
        }, 100);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[33.8958, -118.2208]}
        zoom={13}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEvents onMapClick={handleMapClick} />

        {/* Map ready handler */}
        <MapReadyHandler />

        {/* Compton city boundary */}
        <ComptonBoundary />

        {/* Vehicle markers */}
        {vehicles.map((vehicle) => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={selectedVehicle?.id === vehicle.id}
            onClick={() => onSelectVehicle(vehicle.id)}
          />
        ))}

        {/* Vehicle routes */}
        {vehicles.map((vehicle) => {
          if (vehicle.route && vehicle.route.length > 1) {
            console.log(`Rendering route for ${vehicle.id}:`, vehicle.route);
            return (
              <Polyline
                key={`route-${vehicle.id}`}
                positions={vehicle.route as LatLngExpression[]}
                color={selectedVehicle?.id === vehicle.id ? "blue" : "gray"}
                weight={selectedVehicle?.id === vehicle.id ? 4 : 2}
                opacity={0.7}
              />
            );
          } else {
            console.log(`No route for ${vehicle.id}: route=`, vehicle.route);
          }
          return null;
        })}

        {/* Drawing route waypoints */}
        {isDrawingRoute && waypoints.length > 0 && (
          <Polyline
            positions={waypoints as LatLngExpression[]}
            color="red"
            weight={3}
            opacity={0.8}
            dashArray="5, 5"
          />
        )}

        {/* Pickup and destination markers for selected vehicle */}
        {selectedVehicle && (
          <>
            {selectedVehicle.pickupLocation && (
              <Marker
                position={selectedVehicle.pickupLocation as LatLngExpression}
                icon={new Icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="orange" stroke="white" stroke-width="2"/>
                      <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">P</text>
                    </svg>
                  `),
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">Pickup Location</h3>
                    <p>Lat: {selectedVehicle.pickupLocation[0].toFixed(4)}</p>
                    <p>Lng: {selectedVehicle.pickupLocation[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {selectedVehicle.destination && (
              <Marker
                position={selectedVehicle.destination as LatLngExpression}
                icon={new Icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="red" stroke="white" stroke-width="2"/>
                      <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">D</text>
                    </svg>
                  `),
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">Destination</h3>
                    <p>Lat: {selectedVehicle.destination[0].toFixed(4)}</p>
                    <p>Lng: {selectedVehicle.destination[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>



      {/* Advanced Controls */}
      <AdvancedControls
        selectedVehicle={selectedVehicle}
        onEmergencyStop={onEmergencyStop}
        onLockVehicle={onLockVehicle}
        onUnlockVehicle={onUnlockVehicle}
      />

      {/* Route Control */}
      <RouteControl
        selectedVehicle={selectedVehicle}
        onSendRoute={handleSendRoute}
        onClearRoute={handleClearRoute}
        onReturnToOriginal={handleReturnToOriginal}
        waypoints={waypoints}
        isDrawing={isDrawingRoute}
        onStartDrawing={handleStartDrawing}
        onStopDrawing={handleStopDrawing}
        onClearWaypoints={handleClearWaypoints}
      />

      {/* Refresh button */}
      <button
        onClick={onRefreshVehicles}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors"
      >
        🔄 Refresh All Vehicles
      </button>


    </div>
  );
};

export default VehicleMap; 