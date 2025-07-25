import { Pool } from 'pg';
import axios from 'axios';
const pool = new Pool();

const COMPTON_BOUNDS = {
  latMin: 33.89,
  latMax: 33.91,
  lngMin: -118.23,
  lngMax: -118.21
};

function randomCoord() {
  return [
    COMPTON_BOUNDS.latMin + Math.random() * (COMPTON_BOUNDS.latMax - COMPTON_BOUNDS.latMin),
    COMPTON_BOUNDS.lngMin + Math.random() * (COMPTON_BOUNDS.lngMax - COMPTON_BOUNDS.lngMin)
  ];
}

async function randomRoute() {
  const start = randomCoord();
  const end = randomCoord();
  const coords = `${start[1]},${start[0]};${end[1]},${end[0]}`;
  const osrmUrl = `http://osrm:5000/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const { data } = await axios.get(osrmUrl);
  const waypoints = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return { waypoints, start, end };
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      type TEXT,
      status TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      progress INTEGER DEFAULT 0
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT,
      waypoints JSONB,
      status TEXT
    );
  `);
  // seed vehicles if table is empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM vehicles');
  if (parseInt(rows[0].count) === 0) {
    const vehicles = [
      ...Array.from({ length: 4 }, (_, i) => ({ id: `cybertruck-${i+1}`, type: 'cybertruck' })),
      ...Array.from({ length: 8 }, (_, i) => ({ id: `modely-${i+1}`, type: 'modely' })),
      ...Array.from({ length: 3 }, (_, i) => ({ id: `modelx-${i+1}`, type: 'modelx' })),
    ];
    for (const v of vehicles) {
      const { waypoints, start, end } = await randomRoute();
      const progress = Math.floor(Math.random() * waypoints.length);
      const status = progress < waypoints.length - 1 ? 'occupied' : 'available';
      const [lat, lng] = waypoints[progress];
      await pool.query(
        'INSERT INTO vehicles (id, type, status, lat, lng, progress) VALUES ($1, $2, $3, $4, $5, $6)',
        [v.id, v.type, status, lat, lng, progress]
      );
      await pool.query(
        'INSERT INTO routes (id, vehicle_id, waypoints, status) VALUES ($1, $2, $3, $4)',
        [`route-${v.id}`, v.id, JSON.stringify(waypoints), status]
      );
    }
  }
} 