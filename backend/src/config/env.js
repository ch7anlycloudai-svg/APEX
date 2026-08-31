const path = require('path');

// Load .env — try multiple locations for compatibility with different hosting setups
const dotenv = require('dotenv');
const envFile = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envFile });
if (result.error) {
  console.warn(`Warning: Could not load .env from ${envFile} — using system environment variables`);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  BASE_DOMAIN: process.env.BASE_DOMAIN || 'apexmr.store',
  BASE_STORE_DOMAIN: process.env.BASE_STORE_DOMAIN || 'apexmr.store',
  PLATFORM_DOMAIN: process.env.PLATFORM_DOMAIN || 'apexmr.store',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',

  isProd: (process.env.NODE_ENV || 'production') === 'production',
  isDev: (process.env.NODE_ENV || 'production') !== 'production'
};

// Validate required vars
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = required.filter(key => !env[key]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  console.error('Create a .env file in the project root or set these via hosting environment variables.');
  process.exit(1);
}

module.exports = env;
