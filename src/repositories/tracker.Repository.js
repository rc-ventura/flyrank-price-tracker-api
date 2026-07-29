import db from '../../db/tracker.db.js'


const findAll = async () => {
    return db.prepare('SELECT * FROM trackers').all();
}

const findById = async (id) => {
    const trackerById = db.prepare('SELECT * FROM trackers WHERE id = ?').get(id);
    return trackerById ? trackerById : null;
}

const create = async ({name, url, targetSelector, frequency, status}) => {
    const trackerCreated = db.prepare('INSERT INTO trackers (name, url, targetSelector, frequency, status) VALUES (?, ?, ?, ?, ?)').run(name, url, targetSelector, frequency, status);
    return db.prepare('SELECT * FROM trackers WHERE id = ?').get(trackerCreated.lastInsertRowid);
}

const update = async (id, changes) => {
    const trackerUpdated = db.prepare('SELECT * FROM trackers WHERE id = ?').get(id);
    if (!trackerUpdated) return null;
    Object.assign(trackerUpdated, changes);
    db.prepare('UPDATE trackers SET name = ?, url = ?, targetSelector = ?, frequency = ?, status = ? WHERE id = ?').run(trackerUpdated.name, trackerUpdated.url, trackerUpdated.targetSelector, trackerUpdated.frequency, trackerUpdated.status, id);
    return trackerUpdated;
}

const remove = async (id) => {
    const result = db.prepare('DELETE FROM trackers WHERE id = ?').run(id);
    return result.changes > 0;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
