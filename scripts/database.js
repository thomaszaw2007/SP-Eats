const { Pool } = require('pg');

async function withDatabase(operation, { destructive = false } = {}) {
  const connectionString = process.env.DATABASE_URL;
  let target;
  try {
    target = new URL(connectionString);
  } catch {
    throw new Error('Set DATABASE_URL to an explicit PostgreSQL connection URL.');
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  if (!['postgres:', 'postgresql:'].includes(target.protocol) || !databaseName) {
    throw new Error('DATABASE_URL must specify a PostgreSQL database name.');
  }
  if (destructive && process.env.NODE_ENV === 'production') {
    throw new Error('Database reset and sample reload are disabled in production.');
  }
  if (destructive && process.env.SP_EATS_RESET_DATABASE !== databaseName) {
    throw new Error('SP_EATS_RESET_DATABASE must match the dedicated database in DATABASE_URL.');
  }

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT current_database() AS name');
      if (rows[0].name !== databaseName) {
        throw new Error('The connected database differs from the URL.');
      }

      await client.query('BEGIN');
      try {
        await client.query('SET LOCAL search_path = public');
        await client.query('SELECT pg_advisory_xact_lock(547031)');
        const result = await operation(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

module.exports = { withDatabase };
