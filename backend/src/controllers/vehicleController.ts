import * as Vehicle from '../models/Vehicle';
import * as Route from '../models/Route';

export async function createVehicle(req, res) {
  await Vehicle.createVehicle(req.body);
  res.json({ ok: true });
}

export async function getVehicle(req, res) {
  const v = await Vehicle.getVehicle(req.params.id);
  res.json(v);
}

export async function createRoute(req, res) {
  await Route.createRoute(req.body);
  res.json({ ok: true });
}

export async function getRoute(req, res) {
  const r = await Route.getRoute(req.params.id);
  res.json(r);
}

export async function lockVehicle(req, res) {
  // TODO: actually lock in sim
  res.json({ ok: true, message: `Vehicle ${req.params.id} locked.` });
}

export async function unlockVehicle(req, res) {
  res.json({ ok: true, message: `Vehicle ${req.params.id} unlocked.` });
}

export async function stopVehicle(req, res) {
  res.json({ ok: true, message: `Vehicle ${req.params.id} emergency stopped.` });
}

export async function rerouteVehicle(req, res) {
  res.json({ ok: true, message: `Vehicle ${req.params.id} rerouted.` });
} 