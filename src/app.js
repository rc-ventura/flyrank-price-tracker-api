import express from 'express';
import trackerRouter from './routes/trackerRouter.js';

// singleton pattern
const createApp = () => {
    const app = express();
    
    // swagger
    // TODO: add swagger

    // middleware PARSE JSON
    app.use(express.json());
    
    // middleware routes
    app.use("/api/trackers", trackerRouter);

    // middleware error handler 
    
    return app;
} 


export default createApp;
