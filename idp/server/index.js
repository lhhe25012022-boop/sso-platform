require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.IDP_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

const PINGONE_API_URL = `https://api.pingone.com/v1/environments/${process.env.PINGONE_ENVIRONMENT_ID}`;
const PINGONE_ADMIN_TOKEN = process.env.PINGONE_ADMIN_TOKEN;

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'idp-server',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get PingOne environment info
 */
app.get('/config/environment', async (req, res) => {
  try {
    const response = await axios.get(PINGONE_API_URL, {
      headers: {
        Authorization: `Bearer ${PINGONE_ADMIN_TOKEN}`,
      },
    });

    res.json({
      environmentId: response.data.id,
      name: response.data.name,
      region: response.data.region,
    });
  } catch (error) {
    console.error('Error fetching environment:', error.message);
    res.status(500).json({ error: 'Failed to fetch environment config' });
  }
});

/**
 * List OAuth2 clients
 */
app.get('/clients', async (req, res) => {
  try {
    const response = await axios.get(
      `${PINGONE_API_URL}/applications`,
      {
        headers: {
          Authorization: `Bearer ${PINGONE_ADMIN_TOKEN}`,
        },
      }
    );

    const clients = response.data._embedded?.applications || [];
    res.json({
      count: clients.length,
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        type: client.type,
        protocol: client.protocol,
      })),
    });
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

/**
 * Get specific client details
 */
app.get('/clients/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const response = await axios.get(
      `${PINGONE_API_URL}/applications/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${PINGONE_ADMIN_TOKEN}`,
        },
      }
    );

    res.json({
      id: response.data.id,
      name: response.data.name,
      type: response.data.type,
      protocol: response.data.protocol,
      oauthEndpoint: response.data.oauthEndpoint,
      redirectUris: response.data.redirectUris,
    });
  } catch (error) {
    console.error('Error fetching client:', error.message);
    res.status(500).json({ error: 'Failed to fetch client details' });
  }
});

/**
 * List users
 */
app.get('/users', async (req, res) => {
  try {
    const { filter, limit = 100 } = req.query;
    let url = `${PINGONE_API_URL}/users?limit=${limit}`;
    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${PINGONE_ADMIN_TOKEN}`,
      },
    });

    const users = response.data._embedded?.users || [];
    res.json({
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Create a new user
 */
app.post('/users', async (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const payload = {
      username,
      email,
      name: {
        given: firstName || '',
        family: lastName || '',
      },
      status: 'ACTIVE',
    };

    if (password) {
      payload.password = {
        forceChange: false,
        value: password,
      };
    }

    const response = await axios.post(
      `${PINGONE_API_URL}/users`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PINGONE_ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(201).json({
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      status: response.data.status,
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * Verify JWT token
 */
app.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Decode without verification (for inspection)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    res.json({
      header: decoded.header,
      payload: decoded.payload,
      isValid: true,
    });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(500).json({ error: 'Failed to verify token' });
  }
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
  console.log(`🚀 IDP Server running on http://localhost:${PORT}`);
  console.log(`📋 PingOne Environment: ${process.env.PINGONE_ENVIRONMENT_ID}`);
});
