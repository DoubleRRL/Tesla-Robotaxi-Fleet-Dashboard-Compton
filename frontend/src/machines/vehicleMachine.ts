import { createMachine, assign, fromPromise } from 'xstate';

// Types for vehicle state
export interface VehicleContext {
  id: string;
  type: string;
  position: [number, number];
  battery: number;
  speed: number;
  heading: number;
  route: [number, number][];
  pickupLocation?: [number, number];
  destination?: [number, number];
  assignedRider?: string;
  progress: number;
  eta: string;
  status: string;
}

export type VehicleEvent =
  | { type: 'ASSIGN_ROUTE'; route: [number, number][] }
  | { type: 'PICKUP_REQUEST'; rider: string; pickup: [number, number]; destination: [number, number] }
  | { type: 'PICKUP_COMPLETE' }
  | { type: 'DROP_OFF' }
  | { type: 'PULL_OVER' }
  | { type: 'RESUME' }
  | { type: 'EMERGENCY_STOP' }
  | { type: 'LOCK_VEHICLE' }
  | { type: 'UNLOCK_VEHICLE' }
  | { type: 'UPDATE_POSITION'; position: [number, number] }
  | { type: 'UPDATE_BATTERY'; battery: number }
  | { type: 'UPDATE_SPEED'; speed: number }
  | { type: 'ARRIVE_DESTINATION' }
  | { type: 'START_MOVING' }
  | { type: 'STOP_MOVING' };

// Create the vehicle state machine
export const vehicleMachine = createMachine({
  id: 'vehicle',
  initial: 'available',
  context: {
    id: '',
    type: '',
    position: [33.8958, -118.2208],
    battery: 100,
    speed: 0,
    heading: 0,
    route: [],
    pickupLocation: undefined,
    destination: undefined,
    assignedRider: undefined,
    progress: 0,
    eta: '0 min',
    status: 'available'
  } as VehicleContext,
  states: {
    available: {
      entry: assign({ status: 'available', speed: 0 }),
      on: {
        ASSIGN_ROUTE: {
          target: 'en_route',
          actions: assign({
            route: ({ event }) => event.route,
            destination: ({ event }) => event.route[event.route.length - 1],
            status: 'en route'
          })
        },
        PICKUP_REQUEST: {
          target: 'pickup',
          actions: assign({
            assignedRider: ({ event }) => event.rider,
            pickupLocation: ({ event }) => event.pickup,
            destination: ({ event }) => event.destination,
            status: 'pickup'
          })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        },
        UPDATE_SPEED: {
          actions: assign({ speed: ({ event }) => event.speed })
        }
      },
      // Auto-assign route if vehicle has been idle too long
      after: {
        30000: {
          target: 'en_route',
          actions: assign({
            status: 'en route',
            route: () => generateRandomRoute(),
            destination: () => generateRandomRoute()[generateRandomRoute().length - 1]
          })
        }
      }
    },
    en_route: {
      entry: assign({ status: 'en route' }),
      on: {
        ARRIVE_DESTINATION: {
          target: 'available',
          actions: assign({
            route: [],
            destination: undefined,
            progress: 0,
            status: 'available'
          })
        },
        PICKUP_REQUEST: {
          target: 'pickup',
          actions: assign({
            assignedRider: ({ event }) => event.rider,
            pickupLocation: ({ event }) => event.pickup,
            destination: ({ event }) => event.destination,
            status: 'pickup'
          })
        },
        PULL_OVER: {
          target: 'pull_over',
          actions: assign({ status: 'pull-over' })
        },
        EMERGENCY_STOP: {
          target: 'emergency_stop',
          actions: assign({ status: 'emergency-stop', speed: 0 })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        },
        UPDATE_SPEED: {
          actions: assign({ speed: ({ event }) => event.speed })
        }
      }
    },
    pickup: {
      entry: assign({ status: 'pickup' }),
      on: {
        PICKUP_COMPLETE: {
          target: 'occupied',
          actions: assign({
            status: 'occupied',
            pickupLocation: undefined
          })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        },
        UPDATE_SPEED: {
          actions: assign({ speed: ({ event }) => event.speed })
        }
      }
    },
    occupied: {
      entry: assign({ status: 'occupied' }),
      on: {
        DROP_OFF: {
          target: 'available',
          actions: assign({
            assignedRider: undefined,
            destination: undefined,
            route: [],
            progress: 0,
            status: 'available'
          })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        },
        UPDATE_SPEED: {
          actions: assign({ speed: ({ event }) => event.speed })
        }
      }
    },
    pull_over: {
      entry: assign({ status: 'pull-over', speed: 0 }),
      on: {
        RESUME: {
          target: 'en_route',
          actions: assign({ status: 'en route' })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        }
      }
    },
    emergency_stop: {
      entry: assign({ status: 'emergency-stop', speed: 0 }),
      on: {
        RESUME: {
          target: 'en_route',
          actions: assign({ status: 'en route' })
        },
        UPDATE_POSITION: {
          actions: assign({ position: ({ event }) => event.position })
        },
        UPDATE_BATTERY: {
          actions: assign({ battery: ({ event }) => event.battery })
        }
      }
    }
  }
});

// Helper function to generate random routes within Compton boundaries
function generateRandomRoute(): [number, number][] {
  const comptonBounds = {
    lat: { min: 33.87442, max: 33.92313 },
    lng: { min: -118.26315, max: -118.17995 }
  };
  
  const start: [number, number] = [
    comptonBounds.lat.min + Math.random() * (comptonBounds.lat.max - comptonBounds.lat.min),
    comptonBounds.lng.min + Math.random() * (comptonBounds.lng.max - comptonBounds.lng.min)
  ];
  
  const end: [number, number] = [
    comptonBounds.lat.min + Math.random() * (comptonBounds.lat.max - comptonBounds.lat.min),
    comptonBounds.lng.min + Math.random() * (comptonBounds.lng.max - comptonBounds.lng.min)
  ];
  
  // Generate 2-4 waypoints between start and end
  const waypoints: [number, number][] = [];
  const numWaypoints = 2 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numWaypoints; i++) {
    waypoints.push([
      comptonBounds.lat.min + Math.random() * (comptonBounds.lat.max - comptonBounds.lat.min),
      comptonBounds.lng.min + Math.random() * (comptonBounds.lng.max - comptonBounds.lng.min)
    ]);
  }
  
  return [start, ...waypoints, end];
}

// Fleet management machine to coordinate multiple vehicles
export const fleetMachine = createMachine({
  id: 'fleet',
  initial: 'connecting',
  context: {
    vehicles: new Map<string, any>(),
    selectedVehicle: null,
    socketConnected: false
  },
  states: {
    connecting: {
      on: {
        SOCKET_CONNECTED: {
          target: 'connected',
          actions: assign({ socketConnected: true })
        }
      }
    },
    connected: {
      on: {
        SOCKET_DISCONNECTED: {
          target: 'connecting',
          actions: assign({ socketConnected: false })
        },
        VEHICLE_UPDATE: {
          actions: assign({
            vehicles: ({ context, event }) => {
              const newVehicles = new Map(context.vehicles);
              newVehicles.set(event.id, event);
              return newVehicles;
            }
          })
        },
        SELECT_VEHICLE: {
          actions: assign({ selectedVehicle: ({ event }) => event.vehicleId })
        },
        SEND_ROUTE: {
          actions: 'sendRouteToVehicle'
        },
        EMERGENCY_STOP: {
          actions: 'sendEmergencyStop'
        },
        LOCK_VEHICLE: {
          actions: 'sendLockVehicle'
        },
        UNLOCK_VEHICLE: {
          actions: 'sendUnlockVehicle'
        }
      }
    }
  }
}); 