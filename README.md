# Tesla Robotaxi Management System

real-time fleet management for tesla robotaxis in compton, ca. live tracking, remote control, analytics, and more. see `/docs/` for full specs.

## quick start

```bash
git clone <repo>
cd tesla-robotaxi-system
npm run install:all
docker-compose -f docker-compose.dev.yml up -d
npm run migrate
npm run seed
npm run simulate
npm run dev
```

## features
- 15 vehicles tracked: 4 cybertrucks, 8 model y, 3 model x
- onboarding tour for new users (help button to replay)
- osrm-powered route snapping (real roads)
- real-time vehicle sim, stats, and controls
- postgres persistence for vehicles/routes
- advanced controls: lock/unlock, emergency stop, reroute
- analytics panel: utilization, revenue, surge, charging, etc
- surge pricing, charging, and rider pull-over events

## structure
- frontend: next.js/react dashboard (osm map)
- backend: express api, websocket, osrm, postgres
- simulation: vehicle sim engine
- shared: types/constants
- docs: api, security, deployment

## Testing & Demo

1. **start everything**
   - `npm run install:all`
   - `docker-compose -f docker-compose.dev.yml up -d`
   - `npm run migrate`
   - `npm run seed`
   - `npm run simulate`
   - `npm run dev`

2. **open the dashboard**
   - go to [http://localhost:3000](http://localhost:3000)
   - onboarding tour will guide you (or click Help)

3. **watch the fleet**
   - 15 vehicles will appear, each on a random route and progress
   - some will be charging, some available, some occupied
   - surge pricing panel shows live multiplier
   - analytics panel shows live stats

4. **trigger advanced controls**
   - click a vehicle marker to select
   - use Advanced Controls (bottom right) to lock/unlock, emergency stop, or reroute
   - actions are sent to backend and sim reacts in real time

5. **see charging and surge**
   - vehicles with low battery will go “charging” (greyed out, offline, but visible)
   - surge multiplier increases as more cars are in use

6. **rider pull-over events**
   - on any trip, there’s a <4% chance per tick for a “rider pull-over”
   - when triggered: vehicle marker turns orange, alert modal pops up with ride data and video placeholder, and logs event
   - click “Review in Dojo2” for ML/ops workflow (placeholder)

7. **analytics**
   - utilization, avg trip, revenue, surge history, charging stats update live

---

for more, see `DEPLOYMENT.md` for prod setup, scaling, and monitoring. 