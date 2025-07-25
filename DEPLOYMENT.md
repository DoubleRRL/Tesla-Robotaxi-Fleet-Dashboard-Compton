# Deployment Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- OSRM backend (docker)

## Local Dev
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Production (Docker Compose)
- Copy `.env.example` to `.env` and fill in secrets
- Use a production-ready `docker-compose.yml` (add restart policies, volumes, prod envs)
- Use a reverse proxy (nginx/haproxy) for SSL

## Kubernetes
- Use k8s manifests for frontend, backend, postgres, redis, osrm
- Add readiness/liveness probes
- Use secrets for env vars
- Horizontal Pod Autoscaler for backend
- Use a managed DB (RDS, Cloud SQL, etc) for prod

## Env Vars
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://user:pass@host:5432/robotaxi`
- `REDIS_URL=redis://host:6379`
- `JWT_SECRET=your-secret-key`
- `GOOGLE_MAPS_API_KEY=your-maps-key`
- `WEBSOCKET_PORT=8001`
- `AUDIO_STORAGE_PATH=/tmp/audio`
- `ENCRYPTION_KEY=32-char-key`

## Scaling
- Use k8s HPA or docker swarm for backend
- Use CDN for frontend static assets
- Use Redis cluster for socket/pubsub

## Monitoring/Logging
- Prometheus + Grafana for metrics
- ELK stack for logs
- Alertmanager for critical events

## CI/CD
- GitHub Actions or GitLab CI for build/test/deploy
- Auto-deploy to staging/prod on main branch push 