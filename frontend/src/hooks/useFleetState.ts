import { useActor, useMachine } from '@xstate/react';
import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fleetMachine, vehicleMachine, VehicleContext, VehicleEvent } from '../machines/vehicleMachine';

export interface FleetState {
  vehicles: Map<string, VehicleContext>;
  selectedVehicle: string | null;
  socketConnected: boolean;
}

export const useFleetState = () => {
  const [state, send] = useMachine(fleetMachine);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    let socket: any = null;
    
    const initializeSocket = () => {
      // Clean up any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Determine protocol based on current page protocol
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
      
      socket = io(`${protocol}://localhost:8000/vehicles`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        forceNew: true,
        autoConnect: true
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to backend');
        send({ type: 'SOCKET_CONNECTED' });
      });

      socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from backend:', reason);
        send({ type: 'SOCKET_DISCONNECTED' });
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

      socket.on('reconnect', (attemptNumber: number) => {
        console.log('Reconnected to backend after', attemptNumber, 'attempts');
        send({ type: 'SOCKET_CONNECTED' });
      });

      socket.on('reconnect_error', (error: any) => {
        console.error('Socket reconnection error:', error);
      });

      socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
      });
    };

    // Initialize socket with a small delay to ensure proper cleanup
    const timer = setTimeout(initializeSocket, 100);

    // Fetch initial vehicle data
    const fetchInitialVehicles = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/vehicles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const vehicles = await response.json();
        
        if (Array.isArray(vehicles)) {
          vehicles.forEach((vehicle: any) => {
            send({
              type: 'VEHICLE_UPDATE',
              id: vehicle.id,
              ...vehicle
            });
          });
        } else {
          console.warn('API returned non-array vehicles data:', vehicles);
        }
      } catch (error) {
        console.error('Failed to fetch initial vehicles:', error);
      }
    };

    fetchInitialVehicles();

    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [send]);

  // Handle vehicle updates from socket
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleVehicleUpdate = (data: any) => {
      // Validate position before updating
      const [lat, lng] = [data.lat, data.lng];
      const isWithinCompton = lat >= 33.87442 && lat <= 33.92313 && 
                             lng >= -118.26315 && lng <= -118.17995;
      const isValidPosition = !isNaN(lat) && !isNaN(lng) && 
                             lat >= 33.8 && lat <= 34.0 && 
                             lng >= -118.3 && lng <= -118.1;

      if (isWithinCompton && isValidPosition) {
        send({
          type: 'VEHICLE_UPDATE',
          id: data.id,
          ...data
        });
      } else {
        console.log(`Vehicle ${data.id} position invalid or outside Compton: ${lat}, ${lng}`);
      }
    };

    socket.on('vehicle-update', handleVehicleUpdate);

    return () => {
      socket.off('vehicle-update', handleVehicleUpdate);
    };
  }, [send]);

  // Actions
  const selectVehicle = useCallback((vehicleId: string) => {
    send({ type: 'SELECT_VEHICLE', vehicleId });
  }, [send]);

  const sendRouteToVehicle = useCallback((vehicleId: string, route: [number, number][]) => {
    if (socketRef.current) {
      socketRef.current.emit('send-route', { vehicleId, route });
    }
  }, []);

  const sendEmergencyStop = useCallback((vehicleId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('emergency-stop', { vehicleId });
    }
  }, []);

  const sendLockVehicle = useCallback((vehicleId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('lock-vehicle', { vehicleId });
    }
  }, []);

  const sendUnlockVehicle = useCallback((vehicleId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unlock-vehicle', { vehicleId });
    }
  }, []);

  const refreshAllVehicles = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('refresh-vehicles');
    }
  }, []);

  // Computed values
  const vehicles = Array.from(state.context.vehicles.values());
  const selectedVehicle = state.context.selectedVehicle 
    ? state.context.vehicles.get(state.context.selectedVehicle) 
    : null;
  const vehicleCount = state.context.vehicles.size;

  return {
    // State
    vehicles,
    selectedVehicle,
    socketConnected: state.context.socketConnected,
    vehicleCount,
    
    // Actions
    selectVehicle,
    sendRouteToVehicle,
    sendEmergencyStop,
    sendLockVehicle,
    sendUnlockVehicle,
    refreshAllVehicles,
    
    // Raw state for debugging
    state: state.context
  };
}; 