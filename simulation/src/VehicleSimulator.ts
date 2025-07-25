import { io } from 'socket.io-client';

const args = process.argv[2] ? JSON.parse(process.argv[2]) : { id: 'tesla-001', waypoints: [] };
const { id, waypoints } = args;

const socket = io('http://localhost:8000/vehicles');

let idx = 0;
let charging = false;
let chargeTimeout = null;
let stopped = false;
let locked = false;
let rerouteRequested = false;

function emitPullOver() {
  const rideData = {
    id,
    route: waypoints,
    idx,
    timestamp: Date.now(),
    video: 'placeholder.mp4',
    reason: 'rider pull-over',
  };
  socket.emit('pull-over', rideData);
}

socket.on('control', (cmd) => {
  if (cmd.id !== id) return;
  if (cmd.action === 'stop') stopped = true;
  if (cmd.action === 'unlock') locked = false;
  if (cmd.action === 'lock') locked = true;
  if (cmd.action === 'reroute') rerouteRequested = true;
});

function step() {
  if (charging || stopped) return;
  if (rerouteRequested) {
    idx = 0;
    rerouteRequested = false;
    // TODO: fetch new route from backend
  }
  if (idx < waypoints.length) {
    const [lat, lng] = waypoints[idx];
    const progress = Math.round((idx / (waypoints.length - 1)) * 100);
    let speed = locked ? 0 : 40 + Math.round(Math.random() * 10);
    let battery = 80 - Math.round(progress / 2);
    const eta = `${Math.max(0, waypoints.length - idx - 1)} min`;
    let status = idx === 0 ? 'en route' : (progress === 100 ? 'available' : 'occupied');
    // <4% chance to pull over
    if (Math.random() < 0.04 && status === 'occupied') {
      stopped = true;
      emitPullOver();
      status = 'pull-over';
      socket.emit('vehicle-update', { id, lat, lng, progress, speed: 0, battery, eta: 'pull-over', status });
      return;
    }
    if (battery <= 15 && !charging) {
      status = 'charging';
      charging = true;
      socket.emit('vehicle-update', { id, lat, lng, progress, speed: 0, battery, eta: 'charging', status });
      chargeTimeout = setTimeout(() => {
        charging = false;
        idx = 0;
        battery = 100;
        status = 'available';
        socket.emit('vehicle-update', { id, lat, lng, progress: 0, speed: 0, battery, eta: 'charged', status });
        step();
      }, 6000);
      return;
    }
    socket.emit('vehicle-update', { id, lat, lng, progress, speed, battery, eta, status });
    idx++;
    setTimeout(step, 1000);
  } else {
    socket.emit('vehicle-update', { id, lat: waypoints[waypoints.length-1][0], lng: waypoints[waypoints.length-1][1], progress: 100, speed: 0, battery: 80, eta: 'arrived', status: 'available' });
    socket.disconnect();
    process.exit(0);
  }
}

socket.on('connect', () => {
  step();
}); 