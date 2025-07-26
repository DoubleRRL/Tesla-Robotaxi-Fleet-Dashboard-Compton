import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

interface VehicleMarkerProps {
  position: [number, number];
  id: string;
  color?: string;
  speed?: number;
  heading?: number;
  status?: string;
}

export default function VehicleMarker({ position, id, color, speed, heading, status }: VehicleMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  // Create simple V-shaped directional arrow
  const createTeslaIcon = (heading: number = 0, status: string = 'available') => {
    const size = 30;

    // Simple V shape pointing in direction of travel
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${heading}deg);">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Simple V shape -->
        <path d="M15,5 L25,25 L15,20 L5,25 Z"
              fill="${status === 'occupied' ? '#007AFF' : status === 'charging' ? '#FF9500' : status === 'pull-over' ? '#FF3B30' : '#34C759'}"
              stroke="#FFFFFF"
              stroke-width="1.5"
              filter="url(#glow)"/>

        <!-- Tesla T logo in center -->
        <text x="15" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="white">T</text>

        <!-- Movement indicator dot -->
        ${speed && speed > 0 ? `
          <circle cx="15" cy="7" r="1.5" fill="#FFFFFF" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1s" repeatCount="indefinite"/>
          </circle>
        ` : ''}

        <!-- Status indicator ring -->
        <circle cx="15" cy="15" r="13" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.6"/>
      </svg>
    `;

    return new L.DivIcon({
      html: svg,
      className: `tesla-vehicle-marker ${status}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  // Update icon when position, heading, or status changes
  useEffect(() => {
    if (markerRef.current) {
      const icon = createTeslaIcon(heading, status);
      markerRef.current.setIcon(icon);
    }
  }, [heading, status, speed]);

  // Smooth position animation
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  const icon = createTeslaIcon(heading, status);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
    >
      <Popup>
        <div className="vehicle-popup">
          <h3 className="font-bold text-lg mb-2">Vehicle {id}</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-semibold">Status:</span> {status || 'Unknown'}</div>
            <div><span className="font-semibold">Speed:</span> {speed || 0} mph</div>
            <div><span className="font-semibold">Heading:</span> {heading || 0}°</div>
            <div><span className="font-semibold">Direction:</span> {getCardinalDirection(heading || 0)}</div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Helper function to convert heading to cardinal direction
function getCardinalDirection(heading: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(heading / 22.5) % 16;
  return directions[index];
} 