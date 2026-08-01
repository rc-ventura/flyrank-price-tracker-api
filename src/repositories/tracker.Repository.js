import { seedTrackers, insertData } from '../../db/tracker.db.js'
import pool from '../../db/pool.js'
import { UniqueViolationError } from '../error.js'


// helpers
const translateUniqueViolation = (err) => {
    // Pg unique violation error code
    if (err.code === '23505') throw new UniqueViolationError('A tracker with this url and targetSelector already exists');
    throw err;
}


const findAll = async ({status, search} = {}) => {
    const conditions = []
    const params = []
    
    if (status !== undefined) {
        params.push(status)
        conditions.push(`status =  $${params.length}`)
    }
    
    if (search !== undefined) {
        params.push(`%${search}%`)
        conditions.push(`name ILIKE $${params.length}`)

    }
    
    const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const {rows} = await pool.query(`SELECT * FROM trackers${where} ORDER BY name`, params);
    return rows;
}

const findById = async (id) => {
    const {rows} = await pool.query('SELECT * FROM trackers WHERE id = $1', [id]);
    return rows[0] ?? null;
}

const create = async ({name, url, targetSelector, frequency, status}) => {
    try {
        const {rows} = await pool.query('INSERT INTO trackers (name, url, "targetSelector", frequency, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, url, targetSelector, frequency, status]);
        return rows[0];
    } catch (err) {
        translateUniqueViolation(err);
    }
}

const update = async (id, changes) => {
    const {rows} = await pool.query('SELECT * FROM trackers WHERE id = $1', [id]);
    const existing = rows[0] ?? null
    if(!existing) return null;
    const merged = { ...existing, ...changes };
   try {
        const { rows: updated } = await pool.query(
            'UPDATE trackers SET name = $1, url = $2, "targetSelector" = $3, frequency = $4, status = $5, updated_at = now() WHERE id = $6 RETURNING *',
            [merged.name, merged.url, merged.targetSelector, merged.frequency, merged.status, id]
        );
        return updated[0];
   } catch (err) {
    translateUniqueViolation(err);
   }
}

const remove = async (id) => {
    const {rowCount} = await pool.query('DELETE FROM trackers WHERE id = $1', [id]);
    return rowCount > 0;
}

const countByStatus = async () => {
    const {rows} = await pool.query(`
        SELECT COUNT(*)::integer AS total,
               COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0)::int AS active,
               COALESCE(SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END), 0)::int AS paused
        FROM trackers
    `);
    return rows[0];
}

const reset = async () => {
    const client = await pool.connect();
    try {   
        await client.query('BEGIN');
        // where missing intentional - to delete all trackers and reset the sequence (auto increment table)
        await client.query('TRUNCATE trackers RESTART IDENTITY');
        for (const t of seedTrackers) {
            await client.query(insertData, [t.name, t.url, t.targetSelector, t.frequency, t.status]);
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    const { rows } = await pool.query('SELECT * FROM trackers ORDER BY id');
    return rows;
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
