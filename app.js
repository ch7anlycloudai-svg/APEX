// Hostinger Node.js entry point (Passenger-compatible)
// Load environment variables FIRST, before anything else
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

try {
  const app = require('./backend/src/app');

  // Passenger on Hostinger sets its own port via process.env.PORT
  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`APEX Commerce running on ${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  });

  module.exports = app;
} catch (err) {
  console.error('APEX startup failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
