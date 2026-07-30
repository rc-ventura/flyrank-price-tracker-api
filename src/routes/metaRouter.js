import express from 'express';
import trackerController from '../controllers/trackerController.js';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        name: 'Competitor Price Tracker API',
        version: '1.0',
        endpoints: ['/api/trackers']
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

router.get('/stats', trackerController.getStats);

router.post('/reset', trackerController.resetTrackers);

export default router;