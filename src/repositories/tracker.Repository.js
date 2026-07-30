import db, { seedTrackers } from '../../db/tracker.db.js'


const findAll = async ({status, search} = {}) => {
    const conditions = []
    const params = []
    
    if (status !== undefined) {
        conditions.push('status = ?')
        params.push(status)
    }
    
    if (search !== undefined) {
        conditions.push('name LIKE ?')
        params.push(`%${search}%`)
    }
    
    const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    return db.prepare(`SELECT * FROM trackers${where} ORDER BY name`).all(...params);
}

const findById = async (id) => {
    const trackerById = db.prepare('SELECT * FROM trackers WHERE id = ?').get(id);
    return trackerById ?? null;
}

const create = async ({name, url, targetSelector, frequency, status}) => {
    const trackerCreated = db.prepare('INSERT INTO trackers (name, url, targetSelector, frequency, status) VALUES (?, ?, ?, ?, ?)').run(name, url, targetSelector, frequency, status);
    return db.prepare('SELECT * FROM trackers WHERE id = ?').get(trackerCreated.lastInsertRowid);
}

const update = async (id, changes) => {
    const existing = db.prepare('SELECT * FROM trackers WHERE id = ?').get(id);
    if (!existing) return null;
    const merged = { ...existing, ...changes };
    db.prepare("UPDATE trackers SET name = ?, url = ?, targetSelector = ?, frequency = ?, status = ?, updated_at = datetime('now') WHERE id = ?").run(merged.name, merged.url, merged.targetSelector, merged.frequency, merged.status, id);
    return db.prepare('SELECT * FROM trackers WHERE id = ?').get(id);
}

const remove = async (id) => {
    const result = db.prepare('DELETE FROM trackers WHERE id = ?').run(id);
    return result.changes > 0;
}

const countByStatus = async () => {
    return db.prepare(`
        SELECT COUNT(*) AS total,
               COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) AS active,
               COALESCE(SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END), 0) AS paused
        FROM trackers
    `).get();
}

const reset = async () => {
    const insertData = db.prepare('INSERT INTO trackers (name, url, targetSelector, frequency, status) VALUES (?, ?, ?, ?, ?)');
    const resetTx = db.transaction(() => {
        // where missing intentional - to delete all trackers and reset the sequence (auto increment table)
        db.prepare('DELETE FROM trackers').run();
        db.prepare("DELETE FROM sqlite_sequence WHERE name = 'trackers'").run();
        seedTrackers.forEach(t => insertData.run(t.name, t.url, t.targetSelector, t.frequency, t.status));
    });
    resetTx();
    return db.prepare('SELECT * FROM trackers ORDER BY id').all();
}

export default {
    findAll,
    findById,
    create,
    update,
    remove,
    countByStatus,
    reset
};
