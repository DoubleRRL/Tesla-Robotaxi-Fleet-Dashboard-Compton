import { io } from 'socket.io-client';

const args = process.argv[2] ? JSON.parse(process.argv[2]) : { id: 'tesla-001', waypoints: [] };
const { id, waypoints } = args;

const socket = io('http://localhost:8000/vehicles');

let idx = 0;
function step() {
  if (idx < waypoints.length) {
    const [lat, lng] = waypoints[idx];
    const progress = Math.round((idx / (waypoints.length - 1)) * 100);
    const speed = 40 + Math.round(Math.random() * 10); // fake speed
    const battery = 80 - Math.round(progress / 2); // fake battery
    const eta = `${Math.max(0, waypoints.length - idx - 1)} min`;
    const status = idx === 0 ? 'en route' : (progress === 100 ? 'arrived' : 'en route');
    socket.emit('vehicle-update', { id, lat, lng, progress, speed, battery, eta, status });
    idx++;
    setTimeout(step, 1000);
  } else {
    socket.disconnect();
    process.exit(0);
  }
}

socket.on('connect', () => {
  step();
}); 