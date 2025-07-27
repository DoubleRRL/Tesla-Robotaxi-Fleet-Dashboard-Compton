# 🚗 OSRM Setup Guide for Tesla Robotaxi Fleet Management

## Overview
This guide will help you set up OSRM (Open Source Routing Machine) to provide real street-based routing for the Tesla robotaxi fleet management system, replacing the current straight-line routes with actual road-following paths.

## Prerequisites
- Docker installed and running
- At least 4GB of free disk space
- Internet connection for downloading map data

## Step 1: Download California Map Data

The California map data is already being downloaded. This is a large file (~1.2GB) that contains all roads, intersections, and routing information for California.

```bash
# Navigate to the project directory
cd "robotaxi fleet management dashboard"

# Check if download is complete
ls -la osrm-data/california-latest.osm.pbf
```

## Step 2: Process Map Data with OSRM

Once the download is complete, run the OSRM setup script:

```bash
# Make the script executable (if not already)
chmod +x setup-osrm.sh

# Run the OSRM setup
./setup-osrm.sh
```

This script will:
1. **Extract** road data from the OSM file
2. **Partition** the data for efficient routing
3. **Customize** the graph for MLD (Multi-Level Dijkstra) algorithm
4. **Start** the OSRM server on port 5000

## Step 3: Verify OSRM is Working

Test the OSRM server with a route through Compton:

```bash
# Test route from Compton to Compton (should follow streets)
curl "http://localhost:5000/route/v1/driving/-118.26315,33.87442;-118.17995,33.92313?overview=full&geometries=geojson"
```

You should see a JSON response with:
- `"code": "Ok"`
- A `geometry` field with encoded route coordinates
- `distance` and `duration` information

## Step 4: Update Docker Compose

The `docker-compose.dev.yml` has been updated to use the correct OSRM data path:

```yaml
osrm:
  image: osrm/osrm-backend
  command: osrm-routed --algorithm mld /data/california-latest.osrm
  ports:
    - "5000:5000"
  volumes:
    - ./osrm-data:/data
  depends_on:
    - postgres
    - redis
```

## Step 5: Start the Full System

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev

# Start simulators
./launch-sims-delayed.sh
```

## How OSRM Integration Works

### Backend Integration
- **File**: `backend/src/utils/osrm.ts`
- **Functions**: 
  - `getOSRMRoute()` - Get route between two points
  - `snapToRoad()` - Snap coordinates to nearest road
- **API Endpoint**: `POST /api/v1/vehicles/snap-route`

### Simulator Integration
- **File**: `simulation/src/VehicleSimulator.ts`
- **Method**: `createStreetBasedRoute()` - Now uses OSRM API
- **Fallback**: Falls back to landmark-based routing if OSRM fails

### Frontend Integration
- **File**: `frontend/src/components/Map/VehicleMap.tsx`
- **Function**: `handleSnapRoute()` - Calls backend OSRM endpoint
- **Display**: Shows real street-following routes on the map

## Expected Results

### Before OSRM
- Routes are straight lines between points
- Vehicles appear to "fly" over buildings
- Unrealistic routing behavior

### After OSRM
- Routes follow actual streets and roads
- Vehicles stay on roads and follow traffic patterns
- Realistic routing with proper turns and intersections
- Accurate distance and time calculations

## Troubleshooting

### OSRM Server Not Starting
```bash
# Check if port 5000 is available
lsof -i :5000

# Kill any existing OSRM processes
docker stop osrm-california
docker rm osrm-california

# Restart OSRM
./setup-osrm.sh
```

### Map Data Issues
```bash
# Check if map file is complete
ls -lh osrm-data/california-latest.osm.pbf

# Re-download if corrupted
cd osrm-data
rm california-latest.osm.pbf
curl -O https://download.geofabrik.de/north-america/us/california-latest.osm.pbf
```

### Routing Errors
```bash
# Test OSRM API directly
curl "http://localhost:5000/route/v1/driving/-118.26315,33.87442;-118.17995,33.92313"

# Check OSRM logs
docker logs osrm-california
```

## Performance Notes

- **Initial Load**: OSRM may take 30-60 seconds to start with California data
- **Memory Usage**: ~2-3GB RAM for California routing
- **Response Time**: ~10-50ms per routing request
- **Fallback**: System gracefully falls back to simple routing if OSRM fails

## Next Steps

1. **Test the system** with OSRM enabled
2. **Verify routes** follow streets in Compton
3. **Check performance** with 15 vehicles
4. **Monitor logs** for any routing errors

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Docker containers are running
3. Check OSRM server logs
4. Test OSRM API directly with curl commands 