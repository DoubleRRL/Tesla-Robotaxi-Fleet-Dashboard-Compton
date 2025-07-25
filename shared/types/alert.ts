export interface Alert {
  id: string;
  vehicleId: string;
  type: 'mechanical' | 'battery' | 'route' | 'emergency' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location: Coordinate;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  assignedTo?: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
} 