const env = require('../config/env');
const { supabaseAdmin } = require('../config/supabase');

// Simple in-memory cache for store resolution
const storeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedStore(key) {
  const cached = storeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.store;
  }
  storeCache.delete(key);
  return null;
}

function setCachedStore(key, store) {
  storeCache.set(key, { store, timestamp: Date.now() });
}

/**
 * Tenant resolution middleware.
 * Resolves store from subdomain: {slug}.apexmr.shop
 * Platform domain (apexmr.shop) skips resolution.
 */
async function tenantResolver(req, res, next) {
  try {
    const hostname = (req.hostname || req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
    const baseDomain = env.BASE_STORE_DOMAIN.toLowerCase();
    const platformDomain = env.PLATFORM_DOMAIN.toLowerCase();

    // Platform domain → no store
    if (hostname === platformDomain || hostname === `www.${platformDomain}` || hostname === 'localhost') {
      req.store = null;
      req.isPlatform = true;
      return next();
    }

    // Subdomain resolution: {slug}.apexmr.shop
    if (hostname.endsWith(`.${baseDomain}`)) {
      const slug = hostname.replace(`.${baseDomain}`, '');

      if (!slug || slug.includes('.')) {
        req.store = null;
        req.isPlatform = true;
        return next();
      }

      let store = getCachedStore(`slug:${slug}`);
      if (!store) {
        const { data, error } = await supabaseAdmin
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (error || !data) {
          req.store = null;
          req.storeNotFound = true;
          return next();
        }
        store = data;
        setCachedStore(`slug:${slug}`, store);
      }

      req.store = store;
      req.isPlatform = false;
      return next();
    }

    // Unknown hostname → store not found
    req.store = null;
    req.storeNotFound = true;
    next();
  } catch (err) {
    next(err);
  }
}

function clearStoreCache(storeSlug) {
  if (storeSlug) storeCache.delete(`slug:${storeSlug}`);
}

module.exports = { tenantResolver, clearStoreCache };
