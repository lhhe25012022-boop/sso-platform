# SSO Platform - PingOne Integration

Enterprise-grade Single Sign-On platform leveraging PingOne as the primary identity provider.

## 🏗️ Architecture

```
sso-platform/
├── apps/
│   ├── app-a/         # Sample App 1 (Port 3001)
│   ├── app-b/         # Sample App 2 (Port 3002)
│   └── app-c/         # Sample App 3 (Port 3003)
├── packages/
│   └── auth-client/   # Shared SSO client library
├── idp/
│   └── pingone/       # PingOne configuration & setup
├── infra/
│   └── nginx/         # Reverse proxy configuration
└── README.md
```

## 🔐 Key Features

- **PingOne OAuth2/OIDC Integration** - Primary SSO provider
- **Unified Auth Client** - Shared library across all applications
- **Multi-App Support** - 3 independent applications sharing single SSO
- **Reverse Proxy Setup** - Nginx for routing and load balancing
- **Node.js Backend** - Express-based servers
- **React Frontend** - Modern UI with auth flow handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm/yarn
- PingOne Tenant Account
- Nginx (for proxy setup)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Configure PingOne credentials
# Edit idp/pingone/.env with your PingOne details
```

### Running All Applications

```bash
# Start all apps in development mode
npm run start:all

# Or start individual apps
cd apps/app-a && npm run dev
cd apps/app-b && npm run dev
cd apps/app-c && npm run dev
```

### Access Applications

- App A: http://localhost:3001
- App B: http://localhost:3002
- App C: http://localhost:3003

## 📋 PingOne Configuration

See `idp/pingone/README.md` for detailed setup instructions:

1. Create PingOne Application
2. Configure OAuth2 Redirect URIs
3. Set up API Credentials
4. Configure CORS settings

## 🔄 Authentication Flow

```
┌────────────┐         ┌─────────────┐         ┌──────────────┐
│   Client   │ ────→   │   App Auth  │ ────→   │   PingOne    │
│  (Browser) │         │   Server    │         │  (IdP)       │
└────────────┘         └─────────────┘         └──────────────┘
     ↓                       ↓                        ↓
  Login                Authorization              Authenticate
  Request               Code Flow                 User
     ↓                       ↓                        ↓
┌────────────┐         ┌─────────────┐         ┌──────────────┐
│  Redirect  │ ←─────  │ Token       │ ←─────  │ Auth Token   │
│   to IdP   │         │ Exchange    │         │ + User Info  │
└────────────┘         └─────────────┘         └──────────────┘
```

## 📚 Documentation

- [PingOne Setup Guide](./idp/pingone/README.md)
- [Auth Client Documentation](./packages/auth-client/README.md)
- [Application Examples](./apps/)
- [Nginx Configuration](./infra/nginx/README.md)

## 🛠️ Development

### Project Structure

- **apps/**: Multiple applications sharing the same SSO
- **packages/auth-client/**: Shared authentication library
- **idp/pingone/**: PingOne IdP configuration and utilities
- **infra/nginx/**: Infrastructure as code

### Testing SSO Flow

```bash
# Terminal 1: Start App A
cd apps/app-a && npm run dev

# Terminal 2: Start App B  
cd apps/app-b && npm run dev

# Terminal 3: Start Nginx
cd infra/nginx && docker-compose up
```

Then navigate to http://localhost (proxied through Nginx)

## 📖 Learn More

- [PingOne Documentation](https://apidocs.pingidentity.com/pingone/main/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect](https://openid.net/connect/)

## 📄 License

MIT
