require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { PingOneClient } = require('@sso-platform/auth-client');

const app = express();
const PORT = process.env.APP_C_PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3200',
  credentials: true,
}));

app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(express.json());

// Initialize PingOne Client
const authClient = new PingOneClient({
  clientId: process.env.PINGONE_CLIENT_ID,
  clientSecret: process.env.PINGONE_CLIENT_SECRET,
  environmentId: process.env.PINGONE_ENVIRONMENT_ID,
  region: 'NorthAmerica',
  redirectUri: `${process.env.API_URL || 'http://localhost:3003'}/auth/callback`,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
});

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'app-c', timestamp: new Date().toISOString() });
});

/**
 * Get login URL for frontend
 */
app.get('/auth/login-url', (req, res) => {
  try {
    const state = Buffer.from(Math.random().toString()).toString('base64');
    const nonce = Buffer.from(Math.random().toString()).toString('base64');

    req.session.authState = state;
    req.session.authNonce = nonce;

    const loginUrl = authClient.getAuthorizationUrl(state, nonce);
    res.json({ loginUrl });
  } catch (error) {
    console.error('Error generating login URL:', error);
    res.status(500).json({ error: 'Failed to generate login URL' });
  }
});

/**
 * Callback endpoint from PingOne
 */
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Auth error:', error);
      return res.status(400).json({ error: 'Authentication failed' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    if (state !== req.session.authState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const tokens = await authClient.exchangeCode(code);
    const userInfo = await authClient.getUserInfo(tokens.access_token);

    req.session.user = userInfo;
    req.session.tokens = {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3200';
    res.redirect(`${frontendUrl}/auth/callback?token=${tokens.access_token}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication callback failed' });
  }
});

/**
 * Get current user session
 */
app.get('/auth/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user: req.session.user,
    isAuthenticated: true,
    expiresAt: req.session.tokens?.expiresAt,
  });
});

/**
 * Refresh token endpoint
 */
app.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.session.tokens?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token available' });
    }

    const newTokens = await authClient.refreshToken(refreshToken);

    req.session.tokens = {
      accessToken: newTokens.access_token,
      idToken: newTokens.id_token,
      refreshToken: newTokens.refresh_token || refreshToken,
      expiresAt: Date.now() + newTokens.expires_in * 1000,
    };

    res.json({ accessToken: newTokens.access_token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Logout endpoint
 */
app.post('/auth/logout', (req, res) => {
  const idToken = req.session.tokens?.idToken;
  const logoutUrl = authClient.getLogoutUrl(idToken);

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
  });

  res.json({ logoutUrl });
});

/**
 * Protected endpoint example
 */
app.get('/api/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    message: `Hello from App C, ${req.session.user.given_name || req.session.user.email}!`,
    user: req.session.user,
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 App C server running on http://localhost:${PORT}`);
  console.log(`📝 PingOne Environment: ${process.env.PINGONE_ENVIRONMENT_ID}`);
});
