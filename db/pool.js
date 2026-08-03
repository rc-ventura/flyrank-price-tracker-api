import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Prevent node crashing when idle pool database clients encounter errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err.message);
});

export const closePool = async () => pool.end();

export default pool;