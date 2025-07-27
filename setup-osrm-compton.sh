#!/bin/bash

echo "🚗 Setting up OSRM for Compton, CA Tesla Robotaxi Fleet Management..."

# Compton, CA bounding box (approximate)
COMPTON_BBOX="33.87442,-118.26315,33.92313,-118.17995"

# Check if we have the California data
if [ ! -f "osrm-data/california-latest.osm.pbf" ]; then
    echo "📥 Downloading California map data (this may take a few minutes)..."
    cd osrm-data
    curl -O https://download.geofabrik.de/north-america/us/california-latest.osm.pbf
    cd ..
fi

echo "✂️ Extracting Compton, CA data using osmosis..."

# Install osmosis if not available
if ! command -v osmosis &> /dev/null; then
    echo "📦 Installing osmosis..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install osmosis
    else
        # Linux
        sudo apt-get update && sudo apt-get install -y osmosis
    fi
fi

# Extract Compton data using bounding box
cd osrm-data
osmosis --read-pbf california-latest.osm.pbf \
        --bounding-box top=${COMPTON_BBOX##*,} left=${COMPTON_BBOX%,*} bottom=${COMPTON_BBOX%,*,*} right=${COMPTON_BBOX%,*,*,*} \
        --write-pbf compton-latest.osm.pbf

echo "📊 Processing Compton map data with OSRM..."

# Extract data using OSRM
docker run -t -v "${PWD}:/data" --platform linux/amd64 osrm/osrm-backend osrm-extract -p /opt/car.lua /data/compton-latest.osm.pbf

echo "🔗 Creating hierarchy..."
docker run -t -v "${PWD}:/data" --platform linux/amd64 osrm/osrm-backend osrm-partition /data/compton-latest.osrm

echo "🏗️ Building MLD graph..."
docker run -t -v "${PWD}:/data" --platform linux/amd64 osrm/osrm-backend osrm-customize /data/compton-latest.osrm

echo "✅ OSRM setup complete! Starting OSRM server..."

# Stop any existing OSRM container
docker stop osrm-compton 2>/dev/null || true
docker rm osrm-compton 2>/dev/null || true

# Start OSRM server with Compton data
docker run -d \
  --name osrm-compton \
  --platform linux/amd64 \
  -p 5000:5000 \
  -v "${PWD}:/data" \
  osrm/osrm-backend \
  osrm-routed --algorithm mld /data/compton-latest.osrm

cd ..

echo "🌐 OSRM server running on http://localhost:5000"
echo "🧪 Test with: curl 'http://localhost:5000/route/v1/driving/-118.26315,33.87442;-118.17995,33.92313'"
echo "📁 Compton data size: $(ls -lh osrm-data/compton-latest.osm.pbf | awk '{print $5}')" 