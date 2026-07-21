import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { PingOneClient } from '@sso-platform/auth-client';

dotenv.config();

const app: Express = express();
const PORT = process.env.APP_A_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(express.json());

// Initialize PingOne Client
const authClient = new PingOneClient({
  clientId: process.env.PINGONE_CLIENT_ID!,
  clientSecret: process.env.PINGONE_CLIENT_SECRET,
  environmentId: process.env.PINGONE_ENVIRONMENT_ID!,
  region: 'NorthAmerica',
  redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/auth/callback`,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
});

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'app-a', timestamp: new Date().toISOString() });
});

/**
 * Get login URL for frontend
 */
app.get('/auth/login-url', (req: Request, res: Response) => {
  try {
    const state = Buffer.from(Math.random().toString()).toString('base64');
    const nonce = Buffer.from(Math.random().toString()).toString('base64');

    // Store state and nonce in session
    if (req.session) {
      (req.session as any).authState = state;
      (req.session as any).authNonce = nonce;
    }

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
app.get('/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Auth error:', error);
      return res.status(400).json({ error: 'Authentication failed' });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Verify state
    const storedState = (req.session as any)?.authState;
    if (state !== storedState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for tokens
    const tokens = await authClient.exchangeCode(code);

    // Get user info
    const userInfo = await authClient.getUserInfo(tokens.access_token);

    // Store in session
    if (req.session) {
      (req.session as any).user = userInfo;
      (req.session as any).tokens = {
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      };
    }

    // Redirect to frontend callback handler
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${tokens.access_token}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication callback failed' });
  }
});

/**
 * Get current user session
 */
app.get('/auth/session', (req: Request, res: Response) => {
  const user = (req.session as any)?.user;
  const tokens = (req.session as any)?.tokens;

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user,
    isAuthenticated: true,
    expiresAt: tokens?.expiresAt,
  });
});

/**
 * Refresh token endpoint
 */
app.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = (req.session as any)?.tokens?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token available' });
    }

    const newTokens = await authClient.refreshToken(refreshToken);

    // Update session
    if (req.session) {
      (req.session as any).tokens = {
        accessToken: newTokens.access_token,
        idToken: newTokens.id_token,
        refreshToken: newTokens.refresh_token || refreshToken,
        expiresAt: Date.now() + newTokens.expires_in * 1000,
      };
    }

    res.json({ accessToken: newTokens.access_token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Logout endpoint
 */
app.post('/auth/logout', (req: Request, res: Response) => {
  const idToken = (req.session as any)?.tokens?.idToken;
  const logoutUrl = authClient.getLogoutUrl(idToken);

  // Clear session
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
  }

  res.json({ logoutUrl });
});

/**
 * Protected endpoint example
 */
app.get('/api/protected', (req: Request, res: Response) => {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    message: `Hello ${user.given_name || user.email}!`,
    user,
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 App A server running on http://localhost:${PORT}`);
  console.log(`📝 PingOne Environment: ${process.env.PINGONE_ENVIRONMENT_ID}`);
});
