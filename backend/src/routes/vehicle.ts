import { Router } from 'express';
import { spawn } from 'child_process';
import axios from 'axios';
const router = Router();

// POST /api/v1/vehicles/:id/route
router.post('/:id/route', (req, res) => {
  const { id } = req.params;
  const { waypoints } = req.body;
  // launch sim as child process
  const sim = spawn('node', ['../simulation/src/VehicleSimulator.js', JSON.stringify({ id, waypoints })], {
    stdio: 'inherit'
  });
  res.json({ status: 'ok', vehicleId: id, waypoints });
});

// POST /api/v1/vehicles/snap-route
router.post('/snap-route', async (req, res) => {
  const { waypoints } = req.body;
  if (!waypoints || waypoints.length < 2) return res.status(400).json({ error: 'need at least 2 waypoints' });
  // build OSRM query
  const coords = waypoints.map(([lat, lng]: [number, number]) => `${lng},${lat}`).join(';');
  const osrmUrl = `http://osrm:5000/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const { data } = await axios.get(osrmUrl);
    const snapped = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
    res.json({ snapped });
  } catch (e) {
    res.status(500).json({ error: 'osrm error', details: e.message });
  }
});

export default router; 