// Hostinger Node.js entry point
// Works with both Passenger (export) and direct node (listen)

const app = require('./backend/src/app');
const env = require('./backend/src/config/env');

console.log(`APEX Commerce starting`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Platform domain: ${env.PLATFORM_DOMAIN}`);
console.log(`Store domain: ${env.BASE_STORE_DOMAIN}`);

// Passenger sets 'passenger' in process.env or uses a socket
// If running under Passenger, just export. Otherwise, listen on PORT.
if (typeof(PhusionPassenger) !== 'undefined') {
  // Passenger mode
  PhusionPassenger.configure({ autoInstall: false });
  module.exports = app;
} else {
  // Direct node / Hostinger Node.js mode
  const PORT = env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  module.exports = app;
}
