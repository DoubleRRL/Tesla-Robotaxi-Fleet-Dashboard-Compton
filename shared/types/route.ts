export interface Route {
  id: string;
  vehicleId: string;
  origin: Coordinate;
  destination: Coordinate;
  waypoints: Coordinate[];
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  trafficFactor: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Coordinate {
  lat: number;
  lng: number;
} 