/**
 * PingOne Types and Interfaces
 */

/**
 * @typedef {Object} PingOneConfig
 * @property {string} clientId - PingOne Client ID
 * @property {string} [clientSecret] - PingOne Client Secret
 * @property {string} environmentId - PingOne Environment ID
 * @property {'NorthAmerica'|'Europe'|'AsiaPacific'} region - PingOne Region
 * @property {string} redirectUri - OAuth2 Redirect URI
 * @property {string[]} [scopes] - OAuth2 Scopes
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access Token
 * @property {string} id_token - ID Token
 * @property {string} [refresh_token] - Refresh Token
 * @property {number} expires_in - Token Expiration Time (seconds)
 * @property {string} token_type - Token Type
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} sub - Subject (User ID)
 * @property {string} email - User Email
 * @property {string} [given_name] - Given Name
 * @property {string} [family_name] - Family Name
 * @property {string} [name] - Full Name
 * @property {string} [picture] - Profile Picture URL
 * @property {boolean} [email_verified] - Email Verified
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Is User Authenticated
 * @property {UserInfo} [user] - User Information
 * @property {string} [accessToken] - Access Token
 * @property {string} [idToken] - ID Token
 * @property {number} [expiresAt] - Token Expiration Time
 */

module.exports = {};
