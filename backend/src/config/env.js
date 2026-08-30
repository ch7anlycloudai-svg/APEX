const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  BASE_DOMAIN: process.env.BASE_DOMAIN || 'apexmr.shop',
  BASE_STORE_DOMAIN: process.env.BASE_STORE_DOMAIN || 'apexmr.shop',
  PLATFORM_DOMAIN: process.env.PLATFORM_DOMAIN || 'apexmr.shop',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',

  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production'
};

// Validate required vars
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
for (const key of required) {
  if (!env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = env;
