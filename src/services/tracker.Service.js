import trackerRepository from "../repositories/tracker.Repository.js";
import { ValidationError, NotFoundError } from "../error.js";


const listAllTrackers = async () => {
    let result = await trackerRepository.findAll();
    return result;
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

    return await trackerRepository.create({
        name: String(name).trim(),
        url: String(url).trim(),
        targetSelector: String(targetSelector).trim(),
        frequency: "daily",
        status: "active"
    });
}

const updateTracker = async (id, body = {}) => {
    const hasName = Object.prototype.hasOwnProperty.call(body, 'name');
    const hasUrl = Object.prototype.hasOwnProperty.call(body, 'url');
    const hasTargetSelector = Object.prototype.hasOwnProperty.call(body, 'targetSelector');

    if(!hasName && !hasUrl && !hasTargetSelector) {
        throw new ValidationError("At least one field (name, url, or targetSelector) must be provided for update");
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

    const updated = await trackerRepository.update(id, changes);
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

export default {
    listAllTrackers,
    findTrackerById,
    createTracker,
    updateTracker,
    deleteTracker
};

