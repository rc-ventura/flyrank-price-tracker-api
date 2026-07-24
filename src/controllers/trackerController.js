import trackerRepository from "../repositories/tracker.Repository.js";


// GET /trackers
const getTrackers = async (req, res) => {
    try {
        const trackers = await trackerRepository.getTrackers();
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
        const tracker = await trackerRepository.getTrackerById(Number(id));

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


// PUT /trackers/:id


// DELETE /trackers/:id


export default {
    getTrackers,
    getTrackerById,
}