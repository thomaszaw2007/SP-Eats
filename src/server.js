const app = require('./app');
const pool = require('./models/db');

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL before starting SP Eats.');
  process.exit(1);
}

const port = process.env.PORT || 3000;
const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const server = app.listen(port, host, () => {
  const address = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`App listening at http://${address}:${port}`);
});

// Graceful shutdown
function stop() {
  server.close(() =>
    pool.end().catch(() => {
      process.exitCode = 1;
    }),
  );
}

process.once('SIGTERM', stop);
process.once('SIGINT', stop);
