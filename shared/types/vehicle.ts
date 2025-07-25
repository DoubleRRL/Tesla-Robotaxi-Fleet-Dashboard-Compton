export interface Vehicle {
  id: string;
  status: 'available' | 'occupied' | 'charging' | 'maintenance' | 'issue';
  location: {
    lat: number;
    lng: number;
    heading: number;
    accuracy: number;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  route: {
    waypoints: Coordinate[];
    distance: number;
    duration: number;
    progress: number; // 0-100
  };
  battery: {
    level: number; // 0-100
    charging: boolean;
    estimatedRange: number;
  };
  passenger: {
    count: number;
    tripId?: string;
    pickupTime?: Date;
    estimatedArrival?: Date;
  };
  telemetry: {
    speed: number;
    odometer: number;
    lastUpdate: Date;
    connectivity: 'online' | 'offline' | 'limited';
  };
  maintenance: {
    nextService: Date;
    milesSinceService: number;
    issues: Issue[];
  };
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Issue {
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
} 