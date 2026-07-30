import trackerService from "../services/tracker.Service.js";


// GET /trackers
// Read: list (with optional ?status= and ?search= extras)
const getTrackers = async (req, res, next) => {
    try {
        const trackers = await trackerService.listAllTrackers({ status: req.query.status, search: req.query.search });
        res.status(200).json(trackers);
    } catch (err) {
        next(err);
    }
}

// GET /trackers/:id
const getTrackerById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const tracker = await trackerService.findTrackerById(Number(id));
        res.status(200).json(tracker);
    } catch (err) {
        next(err);
    }
}

// POST /trackers
const createTracker = async (req, res, next) => {

    try {
        const tracker = await trackerService.createTracker(req.body ?? {});
        res.status(201).json(tracker);
    } catch (err) {
        next(err);
    }
}

// PUT /trackers/:id
const updateTracker = async (req, res, next) => {
    const { id } = req.params;
    try {
        const tracker = await trackerService.updateTracker(Number(id), req.body ?? {});
        res.status(200).json(tracker);
    } catch (err) {
        next(err);
    }
}

// DELETE /trackers/:id
const deleteTracker = async (req, res, next) => {
    const { id } = req.params;

    try {
        await trackerService.deleteTracker(Number(id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

// GET /stats
const getStats = async (req, res, next) => {
    try {
        const stats = await trackerService.getStats();
        res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
}

// POST /reset
const resetTrackers = async (req, res, next) => {
    try {
        const trackers = await trackerService.resetTrackers();
        res.status(200).json(trackers);
    } catch (err) {
        next(err);
    }
}

export default {
    getTrackers,
    getTrackerById,
    createTracker,
    updateTracker,
    deleteTracker,
    getStats,
    resetTrackers
}
