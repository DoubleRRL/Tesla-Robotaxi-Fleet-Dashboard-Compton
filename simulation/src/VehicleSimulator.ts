import { io } from 'socket.io-client';
import axios from 'axios';

const args = process.argv[2] ? JSON.parse(process.argv[2]) : { id: 'tesla-001', waypoints: [] };
const { id, waypoints } = args;

const socket = io('http://localhost:8000/vehicles', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true
});

// Add connection debugging
socket.on('connect', () => {
  console.log(`Vehicle ${id} connected to backend`);
});

socket.on('connect_error', (error) => {
  console.log(`Vehicle ${id} connection error:`, error.message);
});

socket.on('disconnect', (reason) => {
  console.log(`Vehicle ${id} disconnected:`, reason);
});

// Compton city boundary constraints (calculated from actual boundary coordinates)
const COMPTON_BOUNDS = {
  latMin: 33.87442,  // Southernmost point
  latMax: 33.92313,  // Northernmost point
  lngMin: -118.26315, // Westernmost point
  lngMax: -118.17995  // Easternmost point
};

// Major streets in Compton for realistic routing
const COMPTON_STREETS = [
  // North-South streets
  { lat: 33.9000, lng: -118.2200, name: 'Central Ave' },
  { lat: 33.9000, lng: -118.2100, name: 'Atlantic Ave' },
  { lat: 33.9000, lng: -118.2000, name: 'Long Beach Blvd' },
  { lat: 33.9000, lng: -118.1900, name: 'Alameda St' },
  { lat: 33.9000, lng: -118.2400, name: 'Compton Blvd' },
  { lat: 33.9000, lng: -118.2500, name: 'Artesia Blvd' },
  
  // East-West streets
  { lat: 33.9200, lng: -118.2200, name: 'Rosecrans Ave' },
  { lat: 33.9100, lng: -118.2200, name: 'Compton Blvd' },
  { lat: 33.8900, lng: -118.2200, name: 'Alondra Blvd' },
  { lat: 33.8800, lng: -118.2200, name: 'Artesia Blvd' },
  
  // Additional street intersections
  { lat: 33.9050, lng: -118.2150, name: 'Central & Compton' },
  { lat: 33.8950, lng: -118.2250, name: 'Atlantic & Alondra' },
  { lat: 33.9150, lng: -118.2050, name: 'Long Beach & Rosecrans' },
  { lat: 33.8850, lng: -118.2350, name: 'Alameda & Artesia' },
  { lat: 33.9250, lng: -118.2450, name: 'Compton & Rosecrans' },
  { lat: 33.8750, lng: -118.1950, name: 'Atlantic & Alondra' }
];

let idx = 0;
let charging = false;
let chargeTimeout: NodeJS.Timeout | null = null;
let stopped = false;
let locked = false;
let rerouteRequested = false;
let currentLat = waypoints[0] ? waypoints[0][0] : 33.9000;
let currentLng = waypoints[0] ? waypoints[0][1] : -118.2200;
let lastUpdateTime = 0;
let refreshRequested = false;
let originalRoute: [number, number][] = [];
let manualRouteActive = false;

// Get a random street intersection within Compton
function getRandomStreetPoint(): [number, number] {
  const street = COMPTON_STREETS[Math.floor(Math.random() * COMPTON_STREETS.length)];
  // Add small random offset to simulate position along the street
  const latOffset = (Math.random() - 0.5) * 0.002; // ~200m variation
  const lngOffset = (Math.random() - 0.5) * 0.002;
  
  const lat = street.lat + latOffset;
  const lng = street.lng + lngOffset;
  
  // Ensure it's still within Compton bounds
  if (lat >= COMPTON_BOUNDS.latMin && lat <= COMPTON_BOUNDS.latMax && 
      lng >= COMPTON_BOUNDS.lngMin && lng <= COMPTON_BOUNDS.lngMax) {
    return [lat, lng];
  }
  
  // Fallback to center of Compton if outside bounds
  return [33.9000, -118.2200];
}

// Generate a route using street intersections
async function generateStreetRoute(): Promise<[number, number][]> {
  const numWaypoints = 3 + Math.floor(Math.random() * 3); // 3-5 waypoints
  const route: [number, number][] = [];
  
  for (let i = 0; i < numWaypoints; i++) {
    route.push(getRandomStreetPoint());
  }
  
  // Try to get a proper route from OSRM if available
  try {
    if (route.length >= 2) {
      const waypoints = route.map(point => `${point[1]},${point[0]}`).join(';');
      const response = await axios.get(`http://localhost:5000/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
      
      if (response.data && response.data.routes && response.data.routes[0]) {
        const coordinates = response.data.routes[0].geometry.coordinates;
        // Convert from [lng, lat] to [lat, lng] format
        return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
    }
  } catch (error: any) {
    console.log(`OSRM route failed for ${id}, using street points:`, error.message);
  }
  
  return route;
}

// Validate coordinates are within Compton and on streets
function isValidStreetPosition(lat: number, lng: number): boolean {
  // Check Compton bounds
  const withinBounds = lat >= COMPTON_BOUNDS.latMin && lat <= COMPTON_BOUNDS.latMax && 
                      lng >= COMPTON_BOUNDS.lngMin && lng <= COMPTON_BOUNDS.lngMax;
  
  if (!withinBounds) return false;
  
  // Check if position is near a known street (within ~100m)
  const nearStreet = COMPTON_STREETS.some(street => {
    const distance = Math.sqrt(
      Math.pow(lat - street.lat, 2) + Math.pow(lng - street.lng, 2)
    );
    return distance < 0.001; // ~100m threshold
  });
  
  return nearStreet;
}

function calculateHeading(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  // Convert to radians
  const fromLatRad = fromLat * Math.PI / 180;
  const fromLngRad = fromLng * Math.PI / 180;
  const toLatRad = toLat * Math.PI / 180;
  const toLngRad = toLng * Math.PI / 180;
  
  // Calculate bearing using great circle formula
  const dLng = toLngRad - fromLngRad;
  const y = Math.sin(dLng) * Math.cos(toLatRad);
  const x = Math.cos(fromLatRad) * Math.sin(toLatRad) - Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLng);
  let heading = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360 degrees
  heading = (heading + 360) % 360;
  
  return heading;
}

function interpolatePosition(fromLat: number, fromLng: number, toLat: number, toLng: number, progress: number): [number, number] {
  const lat = fromLat + (toLat - fromLat) * progress;
  const lng = fromLng + (toLng - fromLng) * progress;
  return [lat, lng];
}

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

// Listen for refresh command from frontend
socket.on('refresh-all', () => {
  console.log(`Vehicle ${id} received refresh command`);
  refreshRequested = true;
  // Reset all state
  idx = 0;
  charging = false;
  stopped = false;
  locked = false;
  rerouteRequested = false;
  manualRouteActive = false;
  if (chargeTimeout) {
    clearTimeout(chargeTimeout);
    chargeTimeout = null;
  }
  // Generate new random position and route
  const [newLat, newLng] = getRandomStreetPoint();
  currentLat = newLat;
  currentLng = newLng;
  lastUpdateTime = Date.now();
});

// Listen for manual route assignment
socket.on('manual-route', (data) => {
  if (data.id !== id) return;
  console.log(`Vehicle ${id} received manual route with ${data.waypoints.length} waypoints`);
  
  // Save current route as original if not already saved
  if (originalRoute.length === 0) {
    originalRoute = [...waypoints];
  }
  
  // Apply manual route
  waypoints.length = 0;
  waypoints.push(...data.waypoints);
  idx = 0;
  manualRouteActive = true;
  
  // Update position to start of new route
  if (waypoints.length > 0) {
    currentLat = waypoints[0][0];
    currentLng = waypoints[0][1];
  }
  
  console.log(`Vehicle ${id} now following manual route`);
});

socket.on('control', (cmd) => {
  if (cmd.id !== id) return;
  if (cmd.action === 'stop') stopped = true;
  if (cmd.action === 'unlock') locked = false;
  if (cmd.action === 'lock') locked = true;
  if (cmd.action === 'reroute') rerouteRequested = true;
  if (cmd.action === 'return-to-original') {
    console.log(`Vehicle ${id} returning to original route`);
    if (originalRoute.length > 0) {
      waypoints.length = 0;
      waypoints.push(...originalRoute);
      idx = 0;
      manualRouteActive = false;
      console.log(`Vehicle ${id} restored original route with ${originalRoute.length} waypoints`);
    }
  }
});

async function step() {
  if (charging || stopped) return;
  
  const now = Date.now();
  if (now - lastUpdateTime < 1000) return; // Only update once per second
  lastUpdateTime = now;
  
  // Handle refresh request
  if (refreshRequested) {
    refreshRequested = false;
    console.log(`Vehicle ${id} refreshing with new route and position`);
    const newRoute = await generateStreetRoute();
    waypoints.length = 0;
    waypoints.push(...newRoute);
    idx = 0;
    
    // Send initial position with random status
    const randomStatus = Math.random() > 0.7 ? 'available' : 'en route';
    const [startLat, startLng] = waypoints[0];
    const randomBattery = 60 + Math.floor(Math.random() * 40); // 60-100%
    const randomSpeed = randomStatus === 'available' ? 0 : 20 + Math.floor(Math.random() * 15);
    
    socket.emit('vehicle-update', {
      id,
      lat: startLat,
      lng: startLng,
      progress: 0,
      speed: randomSpeed,
      battery: randomBattery,
      eta: randomStatus === 'available' ? 'available' : '3 min',
      status: randomStatus,
      heading: 0
    });
    
    // Continue with new route
    setTimeout(step, 2000);
    return;
  }
  
  if (rerouteRequested) {
    idx = 0;
    rerouteRequested = false;
    // Generate new route using streets
    const newRoute = await generateStreetRoute();
    waypoints.length = 0;
    waypoints.push(...newRoute);
  }
  
  if (idx < waypoints.length - 1) {
    const [fromLat, fromLng] = waypoints[idx];
    const [toLat, toLng] = waypoints[idx + 1];
    
    // Calculate progress within current segment (0-1) - smoother movement
    const segmentProgress = (now % 3000) / 3000; // 3 second segments for smoother movement
    
    // Interpolate position between waypoints
    const [lat, lng] = interpolatePosition(fromLat, fromLng, toLat, toLng, segmentProgress);
    
    // Validate position is on streets within Compton
    if (!isValidStreetPosition(lat, lng)) {
      console.log(`Vehicle ${id} off-street or outside Compton, repositioning...`);
      const newRoute = await generateStreetRoute();
      waypoints.length = 0;
      waypoints.push(...newRoute);
      idx = 0;
      setTimeout(step, 1000);
      return;
    }
    
    currentLat = lat;
    currentLng = lng;
    
    // Calculate heading towards next waypoint
    const heading = calculateHeading(lat, lng, toLat, toLng);
    
    const progress = Math.round((idx / (waypoints.length - 1)) * 100);
    let speed = locked ? 0 : 20 + Math.round(Math.random() * 15); // 20-35 mph (city speeds)
    let battery = 80 - Math.round(progress / 2);
    const eta = `${Math.max(0, waypoints.length - idx - 1)} min`;
    let status = idx === 0 ? 'en route' : (progress === 100 ? 'available' : 'occupied');
    
    // <4% chance to pull over
    if (Math.random() < 0.04 && status === 'occupied') {
      stopped = true;
      emitPullOver();
      status = 'pull-over';
      socket.emit('vehicle-update', { id, lat, lng, progress, speed: 0, battery, eta: 'pull-over', status, heading });
      return;
    }
    
    if (battery <= 15 && !charging) {
      status = 'charging';
      charging = true;
      socket.emit('vehicle-update', { id, lat, lng, progress, speed: 0, battery, eta: 'charging', status, heading: 0 });
      chargeTimeout = setTimeout(async () => {
        charging = false;
        idx = 0;
        battery = 100;
        status = 'available';
        // Generate new route after charging
        const newRoute = await generateStreetRoute();
        waypoints.length = 0;
        waypoints.push(...newRoute);
        socket.emit('vehicle-update', { id, lat, lng, progress: 0, speed: 0, battery, eta: 'charged', status, heading: 0 });
        step();
      }, 6000);
      return;
    }
    
    // Send vehicle update with debugging
    const updateData = { id, lat, lng, progress, speed, battery, eta, status, heading };
    socket.emit('vehicle-update', updateData);
    console.log(`Vehicle ${id} update:`, updateData);
    
    // Move to next waypoint after 3 seconds
    setTimeout(() => {
      idx++;
      step();
    }, 3000);
  } else {
    // Route completed, generate new route using streets
    const newRoute = await generateStreetRoute();
    waypoints.length = 0;
    waypoints.push(...newRoute);
    idx = 0;
    
    const [startLat, startLng] = waypoints[0];
    socket.emit('vehicle-update', { 
      id, 
      lat: startLat, 
      lng: startLng, 
      progress: 0, 
      speed: 0, 
      battery: 80, 
      eta: 'new route', 
      status: 'available',
      heading: 0
    });
    
    // Start new route after a short delay
    setTimeout(step, 2000);
  }
}

  // Start simulation when connected
  socket.on('connect', async () => {
    console.log(`Vehicle ${id} starting simulation...`);
    
    // If no waypoints provided, generate initial route using streets
    if (waypoints.length === 0) {
      const initialRoute = await generateStreetRoute();
      waypoints.push(...initialRoute);
    }
    
    // Save original route for later restoration
    if (originalRoute.length === 0) {
      originalRoute = [...waypoints];
      console.log(`Vehicle ${id} saved original route with ${originalRoute.length} waypoints`);
    }
    
    // Validate initial position
    if (!isValidStreetPosition(currentLat, currentLng)) {
      const [newLat, newLng] = getRandomStreetPoint();
      currentLat = newLat;
      currentLng = newLng;
    }
    
    step();
  }); 