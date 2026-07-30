import Database from 'better-sqlite3'
const db = new Database('db/trackers.db')

// Create Table
const createTable = `
 CREATE TABLE IF NOT EXISTS trackers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    targetSelector TEXT NOT NULL,
    frequency TEXT DEFAULT 'daily',
    status TEXT DEFAULT 'active',
    UNIQUE(url, targetSelector)

 
 
 );
`;

db.exec(createTable);

const seedTrackers = [
    { "name": "Tech Store Headphones", "url": "https://site1.com/p1", "targetSelector": ".price", "frequency": "daily", "status": "active" },
    { "name": "Marketplace Monitor", "url": "https://site2.com/p2", "targetSelector": "#price-tag", "frequency": "hourly", "status": "active" },
    { "name": "Boutique Retailer", "url": "https://site3.com/p3", "targetSelector": "span.amount", "frequency": "weekly", "status": "paused" },
]


// Seed only if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM trackers').get();
if (count.count === 0) {
    const insertData = db.prepare('INSERT INTO trackers (name, url, targetSelector, frequency, status) VALUES (?, ?, ?, ?, ?)')

    const insertMany = db.transaction((trackers) => {
        trackers.forEach(t => {
            insertData.run(t.name, t.url, t.targetSelector, t.frequency, t.status)
        })
    })
    
    insertMany(seedTrackers)
};

export default db;