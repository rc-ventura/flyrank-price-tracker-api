import Router from 'express';
import trackerController from '../controllers/trackerController.js';

const router = Router();

router.get('/', trackerController.getTrackers);
router.get("/:id", trackerController.getTrackerById);
router.post("/", trackerController.createTracker);
router.put("/:id", trackerController.updateTracker);
router.delete("/:id", trackerController.deleteTracker);


export default router;