// Hostinger Passenger entry point
// Passenger manages the port — do not call app.listen() here

const app = require('./backend/src/app');
const env = require('./backend/src/config/env');

console.log(`APEX Commerce starting via Passenger`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Platform domain: ${env.PLATFORM_DOMAIN}`);
console.log(`Store domain: ${env.BASE_STORE_DOMAIN}`);

module.exports = app;
