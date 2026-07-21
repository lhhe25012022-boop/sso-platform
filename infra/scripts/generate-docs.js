/**
 * Generate infrastructure documentation
 */

const fs = require('fs');
const path = require('path');

const generateDocs = () => {
  const docs = `# Infrastructure Documentation

## Overview

SSO Platform infrastructure setup and deployment configurations.

## Structure

- **docker-compose.yml** - Local development environment
- **kubernetes/** - Kubernetes deployment manifests
- **scripts/** - Infrastructure utilities

## Docker Compose (Development)

\`\`\`bash
docker-compose up
\`\`\`

### Services

- App A (port 3001)
- App B (port 3002)
- App C (port 3003)
- IDP Server (port 4000)

## Kubernetes (Production)

\`\`\`bash
kubectl apply -f kubernetes/
\`\`\`

### Deployments

- app-a
- app-b
- app-c
- idp-server

### Services

Exposed via LoadBalancer/Ingress

## Environment Variables

See `.env.example` files in each service directory.

## Monitoring

Health check endpoints:
- http://localhost:3001/health (App A)
- http://localhost:3002/health (App B)
- http://localhost:3003/health (App C)
- http://localhost:4000/health (IDP Server)
`;

  const docsPath = path.join(__dirname, '..', 'INFRASTRUCTURE.md');
  fs.writeFileSync(docsPath, docs);
  console.log('✨ Infrastructure documentation generated: INFRASTRUCTURE.md');
};

generateDocs();
