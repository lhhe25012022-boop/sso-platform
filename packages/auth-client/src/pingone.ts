import axios, { AxiosInstance } from 'axios';
import { decode, verify } from 'jsonwebtoken';
import {
  PingOneConfig,
  TokenResponse,
  UserInfo,
  AuthState,
} from './types';
import {
  createPingOneConfig,
  getAuthorizationUrl,
  getTokenUrl,
  getUserInfoUrl,
} from './config';

export class PingOneClient {
  private config: ReturnType<typeof createPingOneConfig>;
  private httpClient: AxiosInstance;

  constructor(config: PingOneConfig) {
    this.config = createPingOneConfig(config);
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
    });
  }

  /**
   * Generate authorization URL for redirect to PingOne login
   */
  getAuthorizationUrl(state: string, nonce?: string): string {
    return getAuthorizationUrl(this.config, state, nonce);
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    try {
      const response = await this.httpClient.post<TokenResponse>(
        getTokenUrl(this.config),
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret || '',
          redirect_uri: this.config.redirectUri,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to exchange code: ${error}`);
    }
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await this.httpClient.get<UserInfo>(
        getUserInfoUrl(this.config),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error}`);
    }
  }

  /**
   * Decode ID token to extract user claims
   */
  decodeIdToken(idToken: string): UserInfo {
    try {
      const decoded = decode(idToken, { complete: true });
      if (!decoded || !decoded.payload) {
        throw new Error('Invalid token format');
      }

      return decoded.payload as UserInfo;
    } catch (error) {
      throw new Error(`Failed to decode ID token: ${error}`);
    }
  }

  /**
   * Verify ID token signature (requires public key)
   */
  verifyIdToken(idToken: string, publicKey?: string): UserInfo {
    try {
      const decoded = verify(idToken, publicKey || '') as UserInfo;
      return decoded;
    } catch (error) {
      throw new Error(`Failed to verify ID token: ${error}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await this.httpClient.post<TokenResponse>(
        getTokenUrl(this.config),
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret || '',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }

  /**
   * Get logout URL
   */
  getLogoutUrl(idToken?: string): string {
    const params = new URLSearchParams({
      id_token_hint: idToken || '',
      post_logout_redirect_uri: this.config.redirectUri,
    });

    return `${this.config.baseUrl}/${this.config.environmentId}/as/signoff?${params.toString()}`;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt * 1000;
  }
}

export * from './types';
export * from './config';
