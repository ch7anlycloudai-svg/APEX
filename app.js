// Hostinger Node.js entry point
try {
  const app = require('./backend/src/app');

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`APEX Commerce running on ${HOST}:${PORT}`);
  });

  module.exports = app;
} catch (err) {
  console.error('APEX startup failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
