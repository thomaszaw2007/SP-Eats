const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { withDatabase } = require('./database');
const seed = require('./seed');

const reset = process.argv.includes('--reset');

withDatabase(
  async (client) => {
    if (!reset) {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_class
          WHERE relnamespace = 'public'::regnamespace AND relkind IN ('r', 'p', 'v', 'm', 'f')
        ) AS occupied
      `);
      if (rows[0].occupied) throw new Error('Database setup requires an empty public schema.');
    }

    const schema = await readFile(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await client.query(schema);
    return seed(client);
  },
  { destructive: reset },
)
  .then((summary) => console.log(`Database ${reset ? 'reset' : 'initialized'} (${summary}).`))
  .catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  });
