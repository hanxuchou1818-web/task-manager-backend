// Creates the database and the "tasks" table, then adds sample tasks if the table is empty.
// Usage:  npm run db:init
// Safe to run more than once: it never deletes existing data.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { connectionOptions } from '../src/db.js';

const dbName = process.env.DB_NAME || 'taskmanager';

const SAMPLE_TASKS = [
  ['Launch an EC2 instance', 'Ubuntu 24.04, t3.micro, attach an Elastic IP.', 'done'],
  ['Create the RDS MySQL database', 'Private access only; allow port 3306 from the EC2 security group.', 'in_progress'],
  ['Deploy the frontend on Amplify', 'Set VITE_API_URL to the HTTPS address of the API.', 'todo'],
];

async function main() {
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error(`DB_NAME "${dbName}" may only contain letters, numbers and underscores.`);
  }

  const options = connectionOptions();
  console.log(`Connecting to MySQL at ${options.host}:${options.port} as ${options.user} ...`);
  const connection = await mysql.createConnection({ ...options, multipleStatements: true });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    await connection.query(schema);
    console.log(`✅ Database "${dbName}" and table "tasks" are ready.`);

    const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM tasks');
    if (count === 0) {
      await connection.query('INSERT INTO tasks (title, description, status) VALUES ?', [SAMPLE_TASKS]);
      console.log(`✅ Added ${SAMPLE_TASKS.length} sample tasks.`);
    } else {
      console.log(`ℹ️  Table already has ${count} task(s); no sample data added.`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(`❌ Database setup failed: ${err.code || ''} ${err.message}`);
  console.error('   Check DB_HOST, DB_USER, DB_PASSWORD in your .env file, and the RDS security group.');
  process.exit(1);
});
