/**
 * PingOne Configuration Utilities
 */

const getRegionUrl = (region) => {
  const regionMap = {
    'NorthAmerica': 'https://auth.pingone.com',
    'Europe': 'https://auth.pingone.eu',
    'AsiaPacific': 'https://auth.pingone.asia',
  };
  return regionMap[region] || regionMap.NorthAmerica;
};

/**
 * Create PingOne configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - Processed configuration
 */
const createPingOneConfig = (config) => {
  return {
    ...config,
    baseUrl: getRegionUrl(config.region),
    scopes: config.scopes || [
      'openid',
      'profile',
      'email',
      'offline_access',
    ],
  };
};

/**
 * Get authorization URL
 * @param {Object} config - PingOne configuration
 * @param {string} state - State parameter
 * @param {string} [nonce] - Nonce parameter
 * @returns {string} - Authorization URL
 */
const getAuthorizationUrl = (config, state, nonce) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    ...(nonce && { nonce }),
  });

  return `${config.baseUrl}/${config.environmentId}/as/authorization?${params.toString()}`;
};

/**
 * Get token URL
 * @param {Object} config - PingOne configuration
 * @returns {string} - Token endpoint URL
 */
const getTokenUrl = (config) => {
  return `${config.baseUrl}/${config.environmentId}/as/token`;
};

/**
 * Get user info URL
 * @param {Object} config - PingOne configuration
 * @returns {string} - UserInfo endpoint URL
 */
const getUserInfoUrl = (config) => {
  return `${config.baseUrl}/${config.environmentId}/as/userinfo`;
};

module.exports = {
  getRegionUrl,
  createPingOneConfig,
  getAuthorizationUrl,
  getTokenUrl,
  getUserInfoUrl,
};
