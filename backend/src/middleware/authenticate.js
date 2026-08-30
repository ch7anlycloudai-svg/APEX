const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { COOKIE_NAME } = require('../utils/cookies');
const ApiError = require('../utils/ApiError');
const { supabaseAdmin } = require('../config/supabase');

async function authenticate(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Fetch user from database to ensure they still exist and get current role
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, store_id')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
