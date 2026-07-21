export interface PingOneConfig {
  clientId: string;
  clientSecret?: string;
  environmentId: string;
  region: 'NorthAmerica' | 'Europe' | 'AsiaPacific';
  redirectUri: string;
  scopes?: string[];
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: UserInfo;
  accessToken?: string;
  idToken?: string;
  expiresAt?: number;
}

export interface AuthorizationCodeFlowParams {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  nonce?: string;
}
