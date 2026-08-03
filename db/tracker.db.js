import pool from './pool.js';

// Create Table
const createTable = `
 CREATE TABLE IF NOT EXISTS trackers(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    "targetSelector" TEXT NOT NULL,
    frequency TEXT DEFAULT 'daily',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(url, "targetSelector")
 
 
 );
`;

// Seed data
const seedTrackers = [
    { "name": "Tech Store Headphones", "url": "https://site1.com/p1", "targetSelector": ".price", "frequency": "daily", "status": "active" },
    { "name": "Marketplace Monitor", "url": "https://site2.com/p2", "targetSelector": "#price-tag", "frequency": "hourly", "status": "active" },
    { "name": "Boutique Retailer", "url": "https://site3.com/p3", "targetSelector": "span.amount", "frequency": "weekly", "status": "paused" },
]

// Sql data query
const insertData = 'INSERT INTO trackers (name, url, "targetSelector", frequency, status) VALUES ($1, $2, $3, $4, $5)'
    

// init database
export const initDb = async () => {
    await pool.query(createTable);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trackers_status ON trackers(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trackers_name ON trackers(name)');

    // Seed only if table is empty
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM trackers');
    if (rows[0].count > 0) return; 

    const client = await pool.connect()

    try {
        await client.query('BEGIN');
        for (const t of seedTrackers) {
            await client.query(insertData, [t.name, t.url, t.targetSelector, t.frequency, t.status]);
        }
        await client.query('COMMIT');
        console.log(`Seeded ${seedTrackers.length} trackers`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

};


export { 
    seedTrackers,
    insertData, 
};

