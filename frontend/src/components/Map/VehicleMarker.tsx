import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function VehicleMarker({ position, id, color }: { position: [number, number], id: string, color?: string }) {
  const teslaIcon = new L.Icon({
    iconUrl: color === 'orange'
      ? 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-orange.png'
      : 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
  return (
    <div className="vehicle-marker">
      <Marker position={position} icon={teslaIcon}>
        <Popup>
          Vehicle ID: {id}
        </Popup>
      </Marker>
    </div>
  );
} 