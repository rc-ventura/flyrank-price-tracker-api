import Router from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import loginRateLimiter from '../middlewares/loginRateLimitMiddleware.js';

const router = Router();

// auth router
router.post("/signup", authController.signup);

// avoid brute force attacks
router.post("/login", loginRateLimiter, authController.login);

// refresh token
router.post("/refresh", authController.refresh);

// guard applied to logout
router.post("/logout", authMiddleware, authController.logout);


export default router;