const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`APEX Commerce server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Platform domain: ${env.PLATFORM_DOMAIN}`);
  console.log(`Store domain: ${env.BASE_STORE_DOMAIN}`);
});
