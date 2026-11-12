// MySQL connection pool.
// A pool keeps a few connections open and reuses them, which is much faster
// than opening a new connection for every request.
import mysql from 'mysql2/promise';

// Settings shared by the API and the db:init script.
export function connectionOptions() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // On AWS RDS set DB_SSL=true so traffic between EC2 and RDS is encrypted.
    // 'Amazon RDS' is a built-in mysql2 profile that trusts the RDS certificates.
    ssl: process.env.DB_SSL === 'true' ? 'Amazon RDS' : undefined,
    // Return DATE/DATETIME columns as plain strings (e.g. "2026-11-30").
    // This avoids time-zone surprises where a due date shifts by one day.
    dateStrings: true,
    connectTimeout: 10000,
  };
}

export const pool = mysql.createPool({
  ...connectionOptions(),
  database: process.env.DB_NAME || 'taskmanager',
  waitForConnections: true,
  connectionLimit: 10,
});
