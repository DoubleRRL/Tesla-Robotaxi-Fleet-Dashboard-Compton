import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const teslaIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default function VehicleMarker({ position, id }: { position: [number, number], id: string }) {
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