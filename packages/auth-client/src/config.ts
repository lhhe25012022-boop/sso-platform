import { PingOneConfig } from './types';

const getRegionUrl = (region: string): string => {
  const regionMap: Record<string, string> = {
    NorthAmerica: 'https://auth.pingone.com',
    Europe: 'https://auth.pingone.eu',
    AsiaPacific: 'https://auth.pingone.asia',
  };
  return regionMap[region] || regionMap.NorthAmerica;
};

export const createPingOneConfig = (config: PingOneConfig) => {
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

export const getAuthorizationUrl = (
  config: ReturnType<typeof createPingOneConfig>,
  state: string,
  nonce?: string
): string => {
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

export const getTokenUrl = (
  config: ReturnType<typeof createPingOneConfig>
): string => {
  return `${config.baseUrl}/${config.environmentId}/as/token`;
};

export const getUserInfoUrl = (
  config: ReturnType<typeof createPingOneConfig>
): string => {
  return `${config.baseUrl}/${config.environmentId}/as/userinfo`;
}
