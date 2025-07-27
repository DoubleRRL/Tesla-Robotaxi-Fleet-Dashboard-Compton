"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const io = require('socket.io-client');
// Compton city bounds
const COMPTON_BOUNDS = {
    latMin: 33.87442,
    latMax: 33.92313,
    lngMin: -118.26315,
    lngMax: -118.17995
};
// Major Compton intersections and landmarks for predefined routes
const COMPTON_LANDMARKS = [
    [33.9000, -118.2200], // Central Ave & Compton Blvd
    [33.9000, -118.2100], // Central Ave & Atlantic Ave
    [33.9000, -118.2000], // Central Ave & Long Beach Blvd
    [33.9000, -118.1900], // Central Ave & Alameda St
    [33.9200, -118.2200], // Rosecrans Ave & Compton Blvd
    [33.9200, -118.2100], // Rosecrans Ave & Atlantic Ave
    [33.9200, -118.2000], // Rosecrans Ave & Long Beach Blvd
    [33.8800, -118.2200], // Artesia Blvd & Compton Blvd
    [33.8800, -118.2100], // Artesia Blvd & Atlantic Ave
    [33.8800, -118.2000], // Artesia Blvd & Long Beach Blvd
    [33.9100, -118.2200], // Compton Blvd & Central Ave
    [33.9100, -118.2100], // Compton Blvd & Atlantic Ave
    [33.9100, -118.2000], // Compton Blvd & Long Beach Blvd
    [33.8900, -118.2200], // Alondra Blvd & Compton Blvd
    [33.8900, -118.2100], // Alondra Blvd & Atlantic Ave
    [33.8900, -118.2000], // Alondra Blvd & Long Beach Blvd
    [33.9050, -118.2150], // Additional major intersections
    [33.8950, -118.2250],
    [33.9150, -118.2050],
    [33.8850, -118.2350],
    [33.9250, -118.2150],
    [33.8750, -118.2250],
    [33.9350, -118.2050]
];
// Predefined routes that cover the entire city
const PREDEFINED_ROUTES = [
    // Route 1: North-South through Central Compton
    [[33.9200, -118.2200], [33.9000, -118.2200], [33.8800, -118.2200]],
    // Route 2: East-West through Central Compton
    [[33.9000, -118.1900], [33.9000, -118.2100], [33.9000, -118.2300]],
    // Route 3: Diagonal through Compton
    [[33.9200, -118.1900], [33.9000, -118.2100], [33.8800, -118.2300]],
    // Route 4: Loop around Compton
    [[33.9200, -118.2200], [33.9200, -118.2000], [33.8800, -118.2000], [33.8800, -118.2200]],
    // Route 5: Central to North
    [[33.9000, -118.2200], [33.9100, -118.2200], [33.9200, -118.2200]],
    // Route 6: Central to South
    [[33.9000, -118.2200], [33.8900, -118.2200], [33.8800, -118.2200]],
    // Route 7: East to West
    [[33.9000, -118.1900], [33.9000, -118.2100], [33.9000, -118.2300]],
    // Route 8: Northeast to Southwest
    [[33.9200, -118.2000], [33.9000, -118.2100], [33.8800, -118.2200]],
    // Route 9: Northwest to Southeast
    [[33.9200, -118.2200], [33.9000, -118.2100], [33.8800, -118.2000]],
    // Route 10: Full city tour
    [[33.9200, -118.2200], [33.9200, -118.2000], [33.9000, -118.2000], [33.9000, -118.2200], [33.8800, -118.2200], [33.8800, -118.2000]],
    // Route 11: Atlantic Ave corridor
    [[33.9200, -118.2100], [33.9000, -118.2100], [33.8800, -118.2100]],
    // Route 12: Long Beach Blvd corridor
    [[33.9200, -118.2000], [33.9000, -118.2000], [33.8800, -118.2000]],
    // Route 13: Alondra Blvd corridor
    [[33.8900, -118.2200], [33.8900, -118.2100], [33.8900, -118.2000]],
    // Route 14: Rosecrans Ave corridor
    [[33.9200, -118.2200], [33.9200, -118.2100], [33.9200, -118.2000]],
    // Route 15: Artesia Blvd corridor
    [[33.8800, -118.2200], [33.8800, -118.2100], [33.8800, -118.2000]]
];
// Charging stations around Compton
const CHARGING_STATIONS = [
    [33.9000, -118.2200], // Central Compton
    [33.9200, -118.2100], // North Compton
    [33.8800, -118.2100], // South Compton
    [33.9000, -118.2000], // East Compton
    [33.9000, -118.2400] // West Compton
];
class VehicleSimulator {
    constructor(id, initialWaypoints = []) {
        this.lastUpdateTime = 0;
        this.chargeTimeout = null;
        this.stepTimeout = null;
        this.refreshRequested = false;
        this.manualRouteActive = false;
        this.originalRoute = [];
        this.state = {
            id,
            currentLat: 33.9000,
            currentLng: -118.2200,
            battery: 80 + Math.floor(Math.random() * 20), // Random battery 80-100%
            status: 'available',
            currentRoute: [],
            routeIndex: 0,
            progress: 0,
            speed: 0,
            heading: 0,
            eta: '0 min',
            pickupLocation: undefined,
            destination: undefined,
            assignedRider: undefined,
            chargingStation: undefined,
            manualRouteActive: false
        };
        // Initialize with random start position
        const [startLat, startLng] = this.getRandomStartPosition();
        this.state.currentLat = startLat;
        this.state.currentLng = startLng;
        // Initialize with a random predefined route
        this.assignRandomRoute();
        this.socket = io('http://localhost:8000/vehicles', {
            transports: ['websocket', 'polling'],
            timeout: 5000
        });
        this.setupSocketListeners();
    }
    getRandomStartPosition() {
        const landmark = COMPTON_LANDMARKS[Math.floor(Math.random() * COMPTON_LANDMARKS.length)];
        // Add small random offset to avoid all vehicles starting at exact same points
        const latOffset = (Math.random() - 0.5) * 0.002;
        const lngOffset = (Math.random() - 0.5) * 0.002;
        return [landmark[0] + latOffset, landmark[1] + lngOffset];
    }
    assignRandomRoute() {
        const route = PREDEFINED_ROUTES[Math.floor(Math.random() * PREDEFINED_ROUTES.length)];
        this.state.currentRoute = [...route];
        this.state.routeIndex = 0;
        this.state.progress = 0;
        this.state.destination = route[route.length - 1];
        this.state.status = 'en route'; // Change status to start moving
    }
    assignRouteToChargingStation() {
        const station = CHARGING_STATIONS[Math.floor(Math.random() * CHARGING_STATIONS.length)];
        this.state.chargingStation = station;
        this.state.currentRoute = [[this.state.currentLat, this.state.currentLng], station];
        this.state.routeIndex = 0;
        this.state.progress = 0;
        this.state.destination = station;
        this.state.status = 'en route';
    }
    assignRouteToPickup(pickupLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.pickupLocation = pickupLocation;
            // Create a street-based route using major Compton streets
            const route = yield this.createStreetBasedRoute([this.state.currentLat, this.state.currentLng], pickupLocation);
            this.state.currentRoute = route;
            this.state.routeIndex = 0;
            this.state.progress = 0;
            this.state.destination = pickupLocation;
            this.state.status = 'en route';
        });
    }
    createStreetBasedRoute(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to get OSRM route
                const response = yield fetch(`http://localhost:5000/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
                const data = yield response.json();
                if (data.code === 'Ok' && data.routes.length > 0) {
                    // Convert GeoJSON coordinates to [lat, lng] format
                    return data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
                }
            }
            catch (error) {
                console.error('OSRM routing failed, using fallback:', error);
            }
            // Fallback to simple street-based routing using major Compton intersections
            const route = [start];
            // Find nearest major street to start point
            const startStreet = this.findNearestStreet(start);
            if (startStreet && this.getDistance(start, startStreet) > 0.001) {
                route.push(startStreet);
            }
            // Find nearest major street to end point
            const endStreet = this.findNearestStreet(end);
            if (endStreet && this.getDistance(end, endStreet) > 0.001) {
                route.push(endStreet);
            }
            route.push(end);
            return route;
        });
    }
    findNearestStreet(point) {
        let nearest = null;
        let minDistance = Infinity;
        for (const street of COMPTON_LANDMARKS) {
            const distance = this.getDistance(point, street);
            if (distance < minDistance && distance < 0.005) { // Within ~500m
                minDistance = distance;
                nearest = street;
            }
        }
        return nearest;
    }
    getDistance(point1, point2) {
        return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
    }
    assignRouteToDestination(destination) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.destination = destination;
            // Create a street-based route to destination
            const route = yield this.createStreetBasedRoute([this.state.currentLat, this.state.currentLng], destination);
            this.state.currentRoute = route;
            this.state.routeIndex = 0;
            this.state.progress = 0;
            this.state.status = 'occupied';
        });
    }
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log(`Vehicle ${this.state.id} connected to backend`);
            this.startSimulation();
        });
        this.socket.on('connect_error', (error) => {
            console.log(`Vehicle ${this.state.id} connection error:`, error.message);
        });
        this.socket.on('disconnect', (reason) => {
            console.log(`Vehicle ${this.state.id} disconnected:`, reason);
        });
        this.socket.on('refresh-all', () => {
            console.log(`Vehicle ${this.state.id} received refresh command`);
            this.refreshRequested = true;
            this.resetState();
            this.startSimulation();
        });
        this.socket.on('manual-route', (data) => {
            if (data.id !== this.state.id)
                return;
            console.log(`Vehicle ${this.state.id} received manual route`);
            this.state.currentRoute = data.waypoints;
            this.state.routeIndex = 0;
            this.state.progress = 0;
            this.state.manualRouteActive = true;
            this.state.status = 'en route';
        });
        this.socket.on('assign-rider', (data) => {
            if (data.vehicleId !== this.state.id)
                return;
            console.log(`Vehicle ${this.state.id} received rider assignment:`, data);
            // Assign the rider and create route to pickup
            this.state.pickupLocation = data.pickupLocation;
            this.state.destination = data.destination;
            this.state.assignedRider = data.riderId;
            // Create route from current position to pickup location
            this.state.currentRoute = [[this.state.currentLat, this.state.currentLng], data.pickupLocation];
            this.state.routeIndex = 0;
            this.state.progress = 0;
            this.state.status = 'en route';
            console.log(`Vehicle ${this.state.id} now en route to pickup ${data.riderId}`);
        });
        this.socket.on('control', (data) => {
            if (data.id !== this.state.id)
                return;
            switch (data.action) {
                case 'stop':
                    this.state.status = 'pull-over';
                    this.state.speed = 0;
                    break;
                case 'lock':
                    // Lock logic would go here
                    break;
                case 'unlock':
                    // Unlock logic would go here
                    break;
                case 'reroute':
                    this.assignRandomRoute();
                    this.state.status = 'en route';
                    break;
                case 'return-to-original':
                    if (this.originalRoute.length > 0) {
                        this.state.currentRoute = [...this.originalRoute];
                        this.state.routeIndex = 0;
                        this.state.progress = 0;
                        this.state.manualRouteActive = false;
                        this.state.status = 'en route';
                    }
                    break;
            }
        });
    }
    resetState() {
        const [startLat, startLng] = this.getRandomStartPosition();
        this.state.currentLat = startLat;
        this.state.currentLng = startLng;
        this.state.battery = 80 + Math.floor(Math.random() * 20);
        this.state.status = 'available';
        this.state.routeIndex = 0;
        this.state.progress = 0;
        this.state.speed = 0;
        this.state.heading = 0;
        this.state.eta = '0 min';
        this.state.pickupLocation = undefined;
        this.state.destination = undefined;
        this.state.assignedRider = undefined;
        this.state.chargingStation = undefined;
        this.assignRandomRoute();
        if (this.chargeTimeout) {
            clearTimeout(this.chargeTimeout);
            this.chargeTimeout = null;
        }
        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
    }
    startSimulation() {
        console.log(`Vehicle ${this.state.id} starting simulation...`);
        this.step();
    }
    step() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            if (now - this.lastUpdateTime < 3000) {
                this.stepTimeout = setTimeout(() => this.step(), 1000);
                return;
            }
            this.lastUpdateTime = now;
            // Check if vehicle needs to charge
            if (this.state.battery <= 20 && this.state.status !== 'charging') {
                this.startCharging();
                return;
            }
            // Handle different states
            switch (this.state.status) {
                case 'available':
                    this.handleAvailableState();
                    break;
                case 'en route':
                    this.handleEnRouteState();
                    break;
                case 'picking up':
                    this.handlePickingUpState();
                    break;
                case 'occupied':
                    this.handleOccupiedState();
                    break;
                case 'charging':
                    // Charging is handled by timeout
                    break;
                case 'pull-over':
                    // Vehicle is stopped
                    break;
            }
            // Emit random events (low probability)
            if (Math.random() < 0.01) { // 1% chance
                this.emitPullOver();
            }
            if (Math.random() < 0.005) { // 0.5% chance
                this.emitHelpRequest();
            }
            this.emitUpdate();
            // Schedule next step
            this.stepTimeout = setTimeout(() => this.step(), 1000);
        });
    }
    handleAvailableState() {
        // If vehicle has an assigned rider, don't assign random route
        if (this.state.assignedRider) {
            return;
        }
        // Simulate waiting for pickup request by driving around the city
        // This mimics real Uber drivers who cruise around waiting for requests
        if (this.state.currentRoute.length === 0 || this.state.routeIndex >= this.state.currentRoute.length - 1) {
            this.assignRandomRoute();
            // assignRandomRoute now sets status to 'en route'
        }
        else {
            // Continue moving along current route even when available
            this.moveAlongRoute();
            // Keep status as 'available' while cruising around
        }
        // Always move if we have a route, regardless of status
        if (this.state.currentRoute.length > 0 && this.state.routeIndex < this.state.currentRoute.length - 1) {
            this.moveAlongRoute();
        }
    }
    handleEnRouteState() {
        if (this.state.currentRoute.length === 0) {
            this.state.status = 'available';
            return;
        }
        // Move along current route
        this.moveAlongRoute();
    }
    handlePickingUpState() {
        // Simulate pickup time (3 seconds)
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (this.state.pickupLocation && this.state.destination) {
                // Start route to destination
                yield this.assignRouteToDestination(this.state.destination);
            }
            else {
                this.state.status = 'available';
            }
        }), 3000);
    }
    handleOccupiedState() {
        if (this.state.currentRoute.length === 0) {
            this.state.status = 'available';
            return;
        }
        // Move along current route
        this.moveAlongRoute();
    }
    moveAlongRoute() {
        if (this.state.routeIndex >= this.state.currentRoute.length - 1) {
            // Reached destination
            this.handleRouteCompletion();
            return;
        }
        const fromPoint = this.state.currentRoute[this.state.routeIndex];
        const toPoint = this.state.currentRoute[this.state.routeIndex + 1];
        // Interpolate position
        const progress = this.state.progress / 100;
        const lat = fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress;
        const lng = fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress;
        this.state.currentLat = lat;
        this.state.currentLng = lng;
        // Calculate heading
        this.state.heading = this.calculateHeading(fromPoint[0], fromPoint[1], toPoint[0], toPoint[1]);
        // Update progress
        this.state.progress += 10; // Move 10% each step
        if (this.state.progress >= 100) {
            this.state.progress = 0;
            this.state.routeIndex++;
        }
        // Update speed and battery
        this.state.speed = 20 + Math.floor(Math.random() * 15); // 20-35 mph
        this.state.battery = Math.max(0, this.state.battery - 1); // Drain battery slowly
        // Update ETA
        const remainingWaypoints = this.state.currentRoute.length - this.state.routeIndex - 1;
        this.state.eta = `${remainingWaypoints} min`;
        // Check for pull-over (4% chance when occupied)
        if (this.state.status === 'occupied' && Math.random() < 0.04) {
            this.state.status = 'pull-over';
            this.state.speed = 0;
            this.emitPullOver();
        }
    }
    handleRouteCompletion() {
        if (this.state.status === 'en route' && this.state.pickupLocation) {
            // Arrived at pickup location
            this.state.status = 'picking up';
            this.state.speed = 0;
        }
        else if (this.state.status === 'occupied') {
            // Arrived at destination
            this.state.status = 'available';
            this.state.speed = 0;
            this.state.pickupLocation = undefined;
            this.state.destination = undefined;
            this.state.assignedRider = undefined;
            // Check if needs to charge
            if (this.state.battery <= 20) {
                this.startCharging();
                return;
            }
            // Assign new random route
            this.assignRandomRoute();
        }
    }
    startCharging() {
        this.state.status = 'charging';
        this.state.speed = 0;
        this.state.eta = 'charging';
        // Find nearest charging station
        const station = this.findNearestChargingStation();
        this.state.chargingStation = station;
        // Route to charging station
        this.state.currentRoute = [[this.state.currentLat, this.state.currentLng], station];
        this.state.routeIndex = 0;
        this.state.progress = 0;
        this.state.destination = station;
        // Charge for 10 seconds
        this.chargeTimeout = setTimeout(() => {
            this.state.battery = 100;
            this.state.status = 'available';
            this.state.chargingStation = undefined;
            this.assignRandomRoute();
            this.step();
        }, 10000);
    }
    findNearestChargingStation() {
        let nearest = CHARGING_STATIONS[0];
        let minDistance = Infinity;
        for (const station of CHARGING_STATIONS) {
            const distance = Math.sqrt(Math.pow(this.state.currentLat - station[0], 2) +
                Math.pow(this.state.currentLng - station[1], 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = station;
            }
        }
        return nearest;
    }
    calculateHeading(fromLat, fromLng, toLat, toLng) {
        const fromLatRad = fromLat * Math.PI / 180;
        const fromLngRad = fromLng * Math.PI / 180;
        const toLatRad = toLat * Math.PI / 180;
        const toLngRad = toLng * Math.PI / 180;
        const dLng = toLngRad - fromLngRad;
        const y = Math.sin(dLng) * Math.cos(toLatRad);
        const x = Math.cos(fromLatRad) * Math.sin(toLatRad) - Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLng);
        let heading = Math.atan2(y, x) * 180 / Math.PI;
        heading = (heading + 360) % 360;
        return heading;
    }
    emitPullOver() {
        // <4% chance for rider pull-over
        if (Math.random() < 0.04 && (this.state.status === 'en route' || this.state.status === 'occupied')) {
            const rideData = {
                id: this.state.id,
                route: this.state.currentRoute,
                timestamp: Date.now(),
                video: 'placeholder.mp4',
                reason: 'rider pull-over',
            };
            this.socket.emit('pull-over', rideData);
            console.log(`Pull-over alert emitted for vehicle ${this.state.id}`);
        }
    }
    emitHelpRequest() {
        // <2% chance for rider help request (very small chance)
        if (Math.random() < 0.02 && (this.state.status === 'en route' || this.state.status === 'occupied')) {
            const helpData = {
                id: this.state.id,
                route: this.state.currentRoute,
                timestamp: Date.now(),
                video: 'placeholder.mp4',
                reason: 'rider help request',
                type: 'help-request'
            };
            this.socket.emit('help-request-alert', helpData);
            console.log(`Help request alert emitted for vehicle ${this.state.id}`);
        }
    }
    emitUpdate() {
        const updateData = {
            id: this.state.id,
            lat: this.state.currentLat,
            lng: this.state.currentLng,
            progress: this.state.progress,
            speed: this.state.speed,
            battery: this.state.battery,
            eta: this.state.eta,
            status: this.state.status,
            heading: this.state.heading,
            route: this.state.currentRoute,
            pickupLocation: this.state.pickupLocation,
            destination: this.state.destination
        };
        this.socket.emit('vehicle-update', updateData);
        console.log(`Vehicle ${this.state.id} update:`, updateData);
        // Schedule next step
        this.stepTimeout = setTimeout(() => this.step(), 3000);
    }
}
// Get vehicle ID and initial waypoints from command line arguments
const args = process.argv.slice(2);
const vehicleData = args[0] ? JSON.parse(args[0]) : { id: 'test-vehicle' };
new VehicleSimulator(vehicleData.id, vehicleData.waypoints || []);
