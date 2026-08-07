import Router from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// auth router
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// guard applied to logout
router.post("/logout", authMiddleware, authController.logout);


export default router;