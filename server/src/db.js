import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('[db] FATAL : DATABASE_URL est requis.');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 10,            // pool de connexions
  idle_timeout: 30,   // ferme les connexions inactives après 30s
  connect_timeout: 10,
});

export default sql;
