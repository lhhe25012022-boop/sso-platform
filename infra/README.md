# Infrastructure Documentation

## Overview

SSO Platform infrastructure setup and deployment configurations.

## Directory Structure

```
infra/
├── docker-compose.yml          # Local development environment
├── dockerfiles/                # Docker build files
│   └── app-server.dockerfile   # Standard Node.js app Dockerfile
├── kubernetes/                 # Kubernetes manifests
│   ├── app-a-deployment.yml    # App A K8s deployment
│   ├── app-b-deployment.yml    # App B K8s deployment
│   ├── app-c-deployment.yml    # App C K8s deployment
│   └── idp-server-deployment.yml # IDP Server K8s deployment
└── scripts/                    # Infrastructure scripts
    ├── validate.js             # Config validator
    └── generate-docs.js        # Documentation generator
```

## Local Development (Docker Compose)

### Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure PingOne credentials:
   ```env
   PINGONE_CLIENT_ID=your-client-id
   PINGONE_CLIENT_SECRET=your-client-secret
   PINGONE_ENVIRONMENT_ID=your-environment-id
   PINGONE_ADMIN_TOKEN=your-admin-token
   ```

3. Start services:
   ```bash
   docker-compose up
   ```

### Services

| Service | Port | URL |
|---------|------|-----|
| App A Server | 3001 | http://localhost:3001 |
| App B Server | 3002 | http://localhost:3002 |
| App C Server | 3003 | http://localhost:3003 |
| IDP Server | 4000 | http://localhost:4000 |

## Production (Kubernetes)

### Prerequisites

- Kubernetes 1.20+
- kubectl configured
- Container registry access

### Deployment

1. Create secrets:
   ```bash
   kubectl create secret generic pingone-credentials \
     --from-literal=client-id=$PINGONE_CLIENT_ID \
     --from-literal=client-secret=$PINGONE_CLIENT_SECRET \
     --from-literal=admin-token=$PINGONE_ADMIN_TOKEN
   ```

2. Create ConfigMap:
   ```bash
   kubectl create configmap pingone-config \
     --from-literal=environment-id=$PINGONE_ENVIRONMENT_ID
   ```

3. Deploy:
   ```bash
   kubectl apply -f kubernetes/
   ```

### Verify Deployment

```bash
kubectl get deployments
kubectl get services
kubectl logs -f deployment/app-a
```

## Health Checks

All services expose a `/health` endpoint:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:4000/health
```

## Monitoring

Services include:
- Liveness probes (restart unhealthy containers)
- Readiness probes (manage traffic routing)
- Health check endpoints

## Scaling

To scale in Kubernetes:

```bash
kubectl scale deployment app-a --replicas=5
```
