import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        name: 'Competitor Price Tracker API',
        version: '1.0',
        endpoints: ['/trackers']
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

export default router;