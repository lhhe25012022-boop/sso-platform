# Auth Client - SSO Library

Shared authentication client library for PingOne OAuth2/OIDC integration.

## Installation

```bash
npm install @sso-platform/auth-client
```

## Usage

### Initialize Client

```javascript
const { PingOneClient } = require('@sso-platform/auth-client');

const authClient = new PingOneClient({
  clientId: process.env.PINGONE_CLIENT_ID,
  clientSecret: process.env.PINGONE_CLIENT_SECRET,
  environmentId: process.env.PINGONE_ENVIRONMENT_ID,
  region: 'NorthAmerica',
  redirectUri: 'http://localhost:3001/auth/callback',
});
```

### Generate Authorization URL

```javascript
const state = require('crypto').randomBytes(16).toString('hex');
const authUrl = authClient.getAuthorizationUrl(state);
// Redirect user to authUrl
```

### Exchange Authorization Code

```javascript
const tokens = await authClient.exchangeCode(code);
console.log(tokens.access_token);
console.log(tokens.id_token);
```

### Get User Information

```javascript
const userInfo = await authClient.getUserInfo(tokens.access_token);
console.log(userInfo.email);
console.log(userInfo.given_name);
```

### Refresh Token

```javascript
const newTokens = await authClient.refreshToken(refreshToken);
```

### Logout

```javascript
const logoutUrl = authClient.getLogoutUrl(idToken);
// Redirect user to logoutUrl
```

## API Reference

### `PingOneClient`

#### `constructor(config)`
Initialize the PingOne client with configuration.

#### `getAuthorizationUrl(state, nonce)`
Generate OAuth2 authorization URL.

#### `exchangeCode(code)`
Exchange authorization code for tokens.

#### `getUserInfo(accessToken)`
Fetch user information using access token.

#### `refreshToken(refreshToken)`
Refresh access token using refresh token.

#### `getLogoutUrl(idToken)`
Generate logout URL.

#### `decodeIdToken(idToken)`
Decode ID token payload.

#### `verifyIdToken(idToken, publicKey)`
Verify and decode ID token.
