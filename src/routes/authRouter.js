import Router from 'express';
import authController from '../controllers/authController.js';

const router = Router();

// auth router
router.post("/signup", authController.signup);
router.post("/login", authController.login);
//router.post("/logout", authController.logout);


export default router;