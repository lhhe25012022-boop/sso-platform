/**
 * PingOne OAuth2/OIDC Client
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const {
  createPingOneConfig,
  getAuthorizationUrl,
  getTokenUrl,
  getUserInfoUrl,
} = require('./config');

class PingOneClient {
  /**
   * Initialize PingOne Client
   * @param {Object} config - PingOne configuration
   */
  constructor(config) {
    this.config = createPingOneConfig(config);
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
    });
  }

  /**
   * Generate authorization URL for redirect to PingOne login
   * @param {string} state - State parameter
   * @param {string} [nonce] - Nonce parameter
   * @returns {string} - Authorization URL
   */
  getAuthorizationUrl(state, nonce) {
    return getAuthorizationUrl(this.config, state, nonce);
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code
   * @returns {Promise<Object>} - Token response
   */
  async exchangeCode(code) {
    try {
      const response = await this.httpClient.post(
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
      throw new Error(`Failed to exchange code: ${error.message}`);
    }
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} - User information
   */
  async getUserInfo(accessToken) {
    try {
      const response = await this.httpClient.get(
        getUserInfoUrl(this.config),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  /**
   * Decode ID token to extract user claims
   * @param {string} idToken - ID token
   * @returns {Object} - Decoded token payload
   */
  decodeIdToken(idToken) {
    try {
      const decoded = jwt.decode(idToken, { complete: true });
      if (!decoded || !decoded.payload) {
        throw new Error('Invalid token format');
      }
      return decoded.payload;
    } catch (error) {
      throw new Error(`Failed to decode ID token: ${error.message}`);
    }
  }

  /**
   * Verify ID token signature (requires public key)
   * @param {string} idToken - ID token
   * @param {string} [publicKey] - Public key
   * @returns {Object} - Verified token payload
   */
  verifyIdToken(idToken, publicKey) {
    try {
      const decoded = jwt.verify(idToken, publicKey || '');
      return decoded;
    } catch (error) {
      throw new Error(`Failed to verify ID token: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New token response
   */
  async refreshToken(refreshToken) {
    try {
      const response = await this.httpClient.post(
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
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get logout URL
   * @param {string} [idToken] - ID token
   * @returns {string} - Logout URL
   */
  getLogoutUrl(idToken) {
    const params = new URLSearchParams({
      id_token_hint: idToken || '',
      post_logout_redirect_uri: this.config.redirectUri,
    });

    return `${this.config.baseUrl}/${this.config.environmentId}/as/signoff?${params.toString()}`;
  }

  /**
   * Check if token is expired
   * @param {number} expiresAt - Token expiration timestamp
   * @returns {boolean} - Is token expired
   */
  isTokenExpired(expiresAt) {
    return Date.now() >= expiresAt * 1000;
  }
}

module.exports = PingOneClient;
