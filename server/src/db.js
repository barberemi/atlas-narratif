import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL ?? 'postgresql://atlas:atlas_dev@localhost:5432/atlas', {
  max: 10,            // pool de connexions
  idle_timeout: 30,   // ferme les connexions inactives après 30s
  connect_timeout: 10,
});

export default sql;
