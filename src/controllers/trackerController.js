import trackerService from "../services/tracker.Service.js";


// GET /trackers
const getTrackers = async (req, res) => {
    try {
        const trackers = await trackerService.listAllTrackers();
        res.status(200).json(trackers);
    } catch (error) {
        console.error("Error getting trackers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /trackers/:id
const getTrackerById = async (req, res) => {
    const { id } = req.params;

    try {
        const tracker = await trackerService.findTrackerById(Number(id));

        if (!tracker) {
            res.status(404).json({ error: `Tracker ${id} not found` });
            return;
        }

        res.status(200).json(tracker);
    } catch (error) {
        console.error("Error getting tracker:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// POST /trackers
const createTracker = async (req, res) => {
    const { name, url, targetSelector, frequency, status } = req.body;

    try {
        const tracker = await trackerService.createTracker({ name, url, targetSelector, frequency, status });
        res.status(201).json(tracker);
    } catch (error) {
        console.error("Error creating tracker:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PUT /trackers/:id
const updateTracker = async (req, res) => {
    const { id } = req.params;
    const { name, url, targetSelector, frequency, status } = req.body;

    try {
        const tracker = await trackerService.updateTracker(Number(id), { name, url, targetSelector, frequency, status });
        res.status(200).json(tracker);
    } catch (error) {
        console.error("Error updating tracker:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// DELETE /trackers/:id
const deleteTracker = async (req, res) => {
    const { id } = req.params;

    try {
        const tracker = await trackerService.deleteTracker(Number(id));
        res.status(200).json(tracker);
    } catch (error) {
        console.error("Error deleting tracker:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export default {
    getTrackers,
    getTrackerById,
    createTracker,
    updateTracker,
    deleteTracker
}
