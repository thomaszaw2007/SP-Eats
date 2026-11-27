const { execFileSync } = require('node:child_process');
const { once } = require('node:events');
const app = require('../src/app');
const pool = require('../src/models/db');

module.exports = async () => {
  execFileSync(process.execPath, ['scripts/reset.js', '--reset'], { stdio: 'inherit' });
  const server = app.listen(process.env.PORT || 3001, '127.0.0.1');
  await once(server, 'listening');

  return async () => {
    const closed = once(server, 'close');
    server.close();
    await closed;
    await pool.end();
  };
};
