import trackerRepository from "../repositories/tracker.Repository.js";
import { ValidationError, NotFoundError } from "../error.js";


const listAllTrackers = async ({status, search} = {}) => {
    if(status !== undefined && status !== 'active' && status !== 'paused') {
        throw new ValidationError("Status must be 'active' or 'paused'");
    }

    let word;
    if(search !== undefined) {
        word = String(search).trim().toLowerCase();
        if(word === '') {
            throw new ValidationError("Search word cannot be empty");
        }
    }

    return trackerRepository.findAll({status, search: word});
}



const findTrackerById = async (id) => {
    let tracker = await trackerRepository.findById(id);
    if(!tracker) {
        throw new NotFoundError(`Tracker ${id} not found`);
    }
    return tracker;
}

const createTracker = async (body = {}) => {
    const { name, url, targetSelector } = body;

    if (name === undefined || name === null || String(name).trim() === '') {
        throw new ValidationError("Name is required");
    }
    if (url === undefined || url === null || String(url).trim() === '') {
        throw new ValidationError("URL is required");
    }
    if (targetSelector === undefined || targetSelector === null || String(targetSelector).trim() === '') {
        throw new ValidationError("Target selector is required");
    }

    try {
        return await trackerRepository.create({
            name: String(name).trim(),
            url: String(url).trim(),
            targetSelector: String(targetSelector).trim(),
            frequency: "daily",
            status: "active"
        });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new ValidationError("A tracker with this url and targetSelector already exists");
        }
        throw err;
    }
}

const updateTracker = async (id, body = {}) => {
    const hasName = Object.prototype.hasOwnProperty.call(body, 'name');
    const hasUrl = Object.prototype.hasOwnProperty.call(body, 'url');
    const hasTargetSelector = Object.prototype.hasOwnProperty.call(body, 'targetSelector');
    const hasFrequency = Object.prototype.hasOwnProperty.call(body, 'frequency');
    const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');

    if(!hasName && !hasUrl && !hasTargetSelector && !hasFrequency && !hasStatus) {
        throw new ValidationError("At least one field must be provided for update");
    }

    const changes = {};

    if(hasName) {
        if (body.name === null || String(body.name).trim() === '') {
            throw new ValidationError("Name cannot be empty");
        }
        changes.name = String(body.name).trim();

    }

    if(hasUrl) {
        if (body.url === null || String(body.url).trim() === '') {
            throw new ValidationError("URL cannot be empty");
        }
        changes.url = String(body.url).trim();
    }

    if(hasTargetSelector) {
        if(body.targetSelector === null || String(body.targetSelector).trim() === '') {
            throw new ValidationError("Target selector cannot be empty");
        }
        changes.targetSelector = String(body.targetSelector).trim();
    }

    if(hasFrequency) {
        const validFrequencies = ['daily', 'hourly', 'weekly'];
        if(!validFrequencies.includes(body.frequency)) {
            throw new ValidationError("Frequency must be one of: daily, hourly, weekly");
        }
        changes.frequency = body.frequency;
    }

    if(hasStatus) {
        const validStatuses = ['active', 'paused'];
        if(!validStatuses.includes(body.status)) {
            throw new ValidationError("Status must be one of: active, paused");
        }
        changes.status = body.status;
    }

    let updated;
    try {
        updated = await trackerRepository.update(id, changes);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new ValidationError("A tracker with this url and targetSelector already exists");
        }
        throw err;
    }
    if (!updated) {
        throw new NotFoundError(`Tracker ${id} not found`);
    }
    return updated;
}

const deleteTracker = async (id) => {
    const removed = await trackerRepository.remove(id);
    if(!removed) {
        throw new NotFoundError(`Tracker ${id} not found`);
    }
    return removed;
}


const getStats = async () => {
    return trackerRepository.countByStatus();
}

const resetTrackers = async () => {
    return trackerRepository.reset();
}

export default {
    listAllTrackers,
    findTrackerById,
    createTracker,
    updateTracker,
    deleteTracker,
    getStats,
    resetTrackers
};

