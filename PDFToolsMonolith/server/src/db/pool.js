import pg from 'pg';

const ssl = (process.env.PGSSL || 'false').toLowerCase() === 'true';

export const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: ssl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    // eslint-disable-next-line no-console
    console.warn('Slow query', { text, duration, rows: res.rowCount });
  }
  return res;
}
