#!/bin/bash

# Launch all 15 vehicle simulators with delays to avoid race conditions
cd simulation

echo "Launching simulators with delays..."

# Cybertrucks - Street-based routes
node dist/VehicleSimulator.js '{"id":"cybertruck-1","waypoints":[[33.9050,-118.2150],[33.8950,-118.2250],[33.9150,-118.2050]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"cybertruck-2","waypoints":[[33.8950,-118.2250],[33.8850,-118.2350],[33.9050,-118.2150]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"cybertruck-3","waypoints":[[33.9150,-118.2050],[33.9050,-118.2150],[33.8950,-118.2250]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"cybertruck-4","waypoints":[[33.8850,-118.2350],[33.9150,-118.2050],[33.8950,-118.2250]]}' &
sleep 0.5

# Model Ys - Street-based routes
node dist/VehicleSimulator.js '{"id":"modely-1","waypoints":[[33.9000,-118.2200],[33.9100,-118.2100],[33.9200,-118.2000]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-2","waypoints":[[33.8900,-118.2300],[33.9000,-118.2200],[33.9100,-118.2100]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-3","waypoints":[[33.9200,-118.2400],[33.9100,-118.2300],[33.9000,-118.2200]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-4","waypoints":[[33.8800,-118.2000],[33.8900,-118.2100],[33.9000,-118.2200]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-5","waypoints":[[33.9050,-118.1800],[33.9150,-118.1900],[33.9250,-118.2000]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-6","waypoints":[[33.8950,-118.2600],[33.9050,-118.2500],[33.9150,-118.2400]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-7","waypoints":[[33.9100,-118.2000],[33.9200,-118.2100],[33.9300,-118.2200]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modely-8","waypoints":[[33.8850,-118.2400],[33.8950,-118.2500],[33.9050,-118.2600]]}' &
sleep 0.5

# Model Xs - Street-based routes
node dist/VehicleSimulator.js '{"id":"modelx-1","waypoints":[[33.9000,-118.1900],[33.9100,-118.2000],[33.9200,-118.2100]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modelx-2","waypoints":[[33.9200,-118.2300],[33.9100,-118.2400],[33.9000,-118.2500]]}' &
sleep 0.5
node dist/VehicleSimulator.js '{"id":"modelx-3","waypoints":[[33.8800,-118.2200],[33.8900,-118.2300],[33.9000,-118.2400]]}' &

echo "All 15 vehicle simulators launched with delays!"
echo "Check the dashboard at http://localhost:3000" 