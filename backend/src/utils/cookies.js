const env = require('../config/env');

const COOKIE_NAME = 'apex_token';

function setTokenCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'lax' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
}

function clearTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'lax' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/'
  });
}

module.exports = { COOKIE_NAME, setTokenCookie, clearTokenCookie };
