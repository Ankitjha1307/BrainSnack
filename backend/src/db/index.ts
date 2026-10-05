import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/index';

const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development') {
    // Log shape, not values - params often carry emails and answer keys.
    console.log('query', { sql: text.replace(/\s+/g, ' ').trim().slice(0, 60), ms: duration, rows: result.rowCount });
  }
  return result;
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export default pool;
