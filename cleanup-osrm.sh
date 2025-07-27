#!/bin/bash

echo "🧹 Cleaning up OSRM data to save disk space..."

# Check current disk usage
echo "📊 Current OSRM data size:"
du -sh osrm-data/

echo ""
echo "🗑️ Removing large California OSRM files..."

# Remove the large California OSRM files
cd osrm-data
rm -f california-latest.osrm*
rm -f california-latest.osm.pbf

echo "✅ Cleanup complete!"
echo ""
echo "📊 Remaining OSRM data size:"
du -sh .

echo ""
echo "💡 Note: OSRM server is still running with the processed data in memory."
echo "   If you restart the OSRM container, you'll need to re-run setup-osrm.sh" 