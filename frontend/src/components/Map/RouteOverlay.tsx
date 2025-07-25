import { Polyline } from 'react-leaflet';

export default function RouteOverlay({ points }: { points: [number, number][] }) {
  if (!points.length) return null;
  return <Polyline positions={points} color="#e82127" weight={5} />;
} 