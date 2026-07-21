# IDP Server - PingOne Integration

Integration server for managing PingOne identity provider resources.

## Installation

```bash
cd idp/server
npm install
```

## Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Set your PingOne credentials:

```env
PINGONE_ENVIRONMENT_ID=your-environment-id
PINGONE_ADMIN_TOKEN=your-admin-token
IDP_PORT=4000
```

## Running

```bash
npm run dev
```

## API Endpoints

### Health Check

```http
GET /health
```

### Get Environment Config

```http
GET /config/environment
```

### List OAuth2 Clients

```http
GET /clients
```

### Get Client Details

```http
GET /clients/:clientId
```

### List Users

```http
GET /users?filter=email+eq+"user@example.com"&limit=100
```

### Create User

```http
POST /users
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!"
}
```

### Verify Token

```http
POST /verify-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
```
