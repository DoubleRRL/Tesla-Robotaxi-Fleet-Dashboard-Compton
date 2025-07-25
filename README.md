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

## structure
- frontend: next.js/react dashboard (osm map)
- backend: express api, websocket, osrm
- simulation: vehicle sim engine
- shared: types/constants
- docs: api, security, deployment 