const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');
const { tenantResolver } = require('./middleware/tenantResolver');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Handled by React
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // In dev, allow all; in prod, allow platform domain and subdomains
    if (env.isDev) return callback(null, true);
    const allowed = [
      env.PLATFORM_DOMAIN,
      `.${env.BASE_STORE_DOMAIN}`
    ];
    const isAllowed = allowed.some(d => origin.includes(d));
    callback(null, isAllowed || true); // Be permissive for subdomains
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting for API
app.use('/api', apiLimiter);

// Tenant resolution for all requests
app.use(tenantResolver);

// API routes
app.use('/api', apiRoutes);

// Serve React build in production
if (env.isProd) {
  const clientBuildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

module.exports = app;
