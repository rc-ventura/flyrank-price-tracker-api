import Router from 'express';
import publicController from '../controllers/publicController.js';

const router = Router();

// public router
router.get("/info", publicController.getPublicInfo);


export default router;