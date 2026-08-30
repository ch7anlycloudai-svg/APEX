const ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  CUSTOMER: 'customer'
};

const RESERVED_SLUGS = [
  'www', 'admin', 'api', 'app', 'dashboard', 'login', 'register',
  'support', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'webmail',
  'cpanel', 'whm', 'ns1', 'ns2', 'cdn', 'static', 'assets',
  'blog', 'help', 'docs', 'status', 'billing', 'account',
  'store', 'stores', 'merchant', 'merchants', 'customer', 'customers'
];

const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const DOMAIN_STATUSES = {
  PENDING: 'pending',
  VERIFYING: 'verifying',
  CONNECTED: 'connected',
  FAILED: 'failed',
  DISABLED: 'disabled'
};

module.exports = { ROLES, RESERVED_SLUGS, ORDER_STATUSES, DOMAIN_STATUSES };
