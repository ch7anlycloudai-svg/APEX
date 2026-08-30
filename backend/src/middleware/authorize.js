const ApiError = require('../utils/ApiError');

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
}

// Middleware to ensure merchant can only access their own store
function requireStoreOwnership(req, res, next) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (req.user.role === 'admin') {
    return next(); // Admin can access any store
  }

  if (!req.user.store_id) {
    return next(ApiError.forbidden('No store associated with this account'));
  }

  // Set the store_id from the authenticated user, NOT from request
  req.storeId = req.user.store_id;
  next();
}

module.exports = { authorize, requireStoreOwnership };
