# Auth Client - SSO Library

Shared authentication client library for PingOne OAuth2/OIDC integration.

## Installation

```bash
npm install @sso-platform/auth-client
```

## Usage

### Initialize Client

```typescript
import { PingOneClient } from '@sso-platform/auth-client';

const authClient = new PingOneClient({
  clientId: process.env.PINGONE_CLIENT_ID,
  clientSecret: process.env.PINGONE_CLIENT_SECRET,
  environmentId: process.env.PINGONE_ENVIRONMENT_ID,
  region: 'NorthAmerica',
  redirectUri: 'http://localhost:3001/auth/callback',
});
```

### Generate Authorization URL

```typescript
const state = crypto.randomBytes(16).toString('hex');
const authUrl = authClient.getAuthorizationUrl(state);
// Redirect user to authUrl
```

### Exchange Authorization Code

```typescript
const tokens = await authClient.exchangeCode(code);
console.log(tokens.access_token);
console.log(tokens.id_token);
```

### Get User Information

```typescript
const userInfo = await authClient.getUserInfo(tokens.access_token);
console.log(userInfo.email);
console.log(userInfo.given_name);
```

### Refresh Token

```typescript
const newTokens = await authClient.refreshToken(refreshToken);
```

### Logout

```typescript
const logoutUrl = authClient.getLogoutUrl(idToken);
// Redirect user to logoutUrl
```

## API Reference

### `PingOneClient`

#### `constructor(config: PingOneConfig)`

#### `getAuthorizationUrl(state: string, nonce?: string): string`
Generate OAuth2 authorization URL.

#### `exchangeCode(code: string): Promise<TokenResponse>`
Exchange authorization code for tokens.

#### `getUserInfo(accessToken: string): Promise<UserInfo>`
Fetch user information.

#### `refreshToken(refreshToken: string): Promise<TokenResponse>`
Refresh access token.

#### `getLogoutUrl(idToken?: string): string`
Generate logout URL.

#### `decodeIdToken(idToken: string): UserInfo`
Decode ID token payload.

## Types

```typescript
interface PingOneConfig {
  clientId: string;
  clientSecret?: string;
  environmentId: string;
  region: 'NorthAmerica' | 'Europe' | 'AsiaPacific';
  redirectUri: string;
  scopes?: string[];
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface UserInfo {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}
```
