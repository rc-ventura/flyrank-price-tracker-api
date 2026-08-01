import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const closePool = async () => pool.end();

export default pool;