#!/bin/bash

echo "🚗 Setting up OSRM for Tesla Robotaxi Fleet Management..."

# Check if we're in the right directory
if [ ! -f "osrm-data/california-latest.osm.pbf" ]; then
    echo "❌ California map data not found in osrm-data/ directory. Please run: curl -O https://download.geofabrik.de/north-america/us/california-latest.osm.pbf"
    exit 1
fi

echo "📊 Processing California map data with OSRM..."

# Extract data using OSRM
docker run -t -v "${PWD}/osrm-data:/data" --platform linux/amd64 osrm/osrm-backend osrm-extract -p /opt/car.lua /data/california-latest.osm.pbf

echo "🔗 Creating hierarchy..."
docker run -t -v "${PWD}/osrm-data:/data" --platform linux/amd64 osrm/osrm-backend osrm-partition /data/california-latest.osrm

echo "🏗️ Building MLD graph..."
docker run -t -v "${PWD}/osrm-data:/data" --platform linux/amd64 osrm/osrm-backend osrm-customize /data/california-latest.osrm

echo "✅ OSRM setup complete! Starting OSRM server..."

# Start OSRM server
docker run -d \
  --name osrm-california \
  --platform linux/amd64 \
  -p 5000:5000 \
  -v "${PWD}/osrm-data:/data" \
  osrm/osrm-backend \
  osrm-routed --algorithm mld /data/california-latest.osrm

echo "🌐 OSRM server running on http://localhost:5000"
echo "🧪 Test with: curl 'http://localhost:5000/route/v1/driving/-118.26315,33.87442;-118.17995,33.92313'" 