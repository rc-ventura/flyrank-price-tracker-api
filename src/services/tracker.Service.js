import trackerRepository from "../repositories/tracker.Repository.js";


const listAllTrackers = async () => {
    return await trackerRepository.findAll();
}

const findTrackerById = async (id) => {
    return await trackerRepository.findById(id);
}

const createTracker = async (tracker) => {
    return await trackerRepository.create(tracker);
}

const updateTracker = async (id, tracker) => {
    return await trackerRepository.update(id, tracker);
}

const deleteTracker = async (id) => {
    return await trackerRepository.remove(id);
}

export default {
    listAllTrackers,
    findTrackerById,
    createTracker,
    updateTracker,
    deleteTracker
};

