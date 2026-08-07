import Router from 'express';
import protectedController from '../controllers/protectedController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/adminMiddleware.js';

const router = Router();

// guard — authentication (401) - I dont kwow who are you?
router.use(authMiddleware)

// protected router
router.get("/profile", protectedController.getProfile);
router.get("/dashboard", protectedController.getDashboard);

// admin-only route — authorization (403) - I know who you are, but you are not admin
router.get("/admin", requireAdmin, protectedController.getAdminArea);

export default router;