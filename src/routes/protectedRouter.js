import Router from 'express';
import protectedController from '../controllers/protectedController.js';

const router = Router();

// protected router
router.get("/profile", protectedController.getProfile);


export default router;