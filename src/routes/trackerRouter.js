import Router from 'express';
import trackerController from '../controllers/trackerController.js';

const router = Router();

router.get('/', trackerController.getTasks);
router.get("/:id", trackerController.getTaskById);
router.post("/", trackerController.createTask);
router.put("/:id", trackerController.updateTask);
router.delete("/:id", trackerController.deleteTask);

export default router;