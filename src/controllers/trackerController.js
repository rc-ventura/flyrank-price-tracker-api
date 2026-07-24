import trackerRepository from "../repositories/tracker.Repository.js";


// GET /trackers
const getTracker = async () => {
    
    try{
        const tracker = await trackerRepository.getTracker();

    if(!tracker) {
        res.status(404).send("Tracker not found");
        return;
    }

    res.status(200).send(tracker);
    } catch (error) {
        console.error("Error getting tracker:", error);
        res.status(500).send("Internal Server Error");
    }
}

// GET /trackers/:id
const getTrackerById = async (req, res) => {
    const {id} = req.params;

    try{
        const tracker = await trackerRepository.getTrackerById(Number(id));

    if(!tracker) {
        res.status(404).send("Tracker not found");
        return;
    }

    res.status(200).send(tracker);
    } catch (error) {
        console.error("Error getting task:", error);
        res.status(500).send("Internal Server Error");
    }
}

// POST /tasks


// PUT /tasks/:id

// DELETE /tasks/:id


export default {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
}