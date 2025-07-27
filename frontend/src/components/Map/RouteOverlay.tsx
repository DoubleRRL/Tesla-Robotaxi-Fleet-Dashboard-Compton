import { Polyline } from 'react-leaflet';

interface RouteOverlayProps {
  points: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
}

export default function RouteOverlay({ 
  points, 
  color = "#e82127", 
  weight = 5, 
  opacity = 1 
}: RouteOverlayProps) {
  if (!points.length) return null;
  return <Polyline positions={points} color={color} weight={weight} opacity={opacity} />;
} 