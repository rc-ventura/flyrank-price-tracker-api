import Router from 'express';
import protectedController from '../controllers/protectedController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// guard
router.use(authMiddleware)

// protected router
router.get("/profile", protectedController.getProfile);
router.get("/dashboard", protectedController.getDashboard);

export default router;