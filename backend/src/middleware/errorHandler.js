const env = require('../config/env');

function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Don't expose internal errors in production
  if (statusCode === 500 && env.isProd) {
    message = 'Internal server error';
  }

  if (env.isDev) {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = errorHandler;
