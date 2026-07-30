import express from 'express';
import trackerRouter from './routes/trackerRouter.js';
import metaRouter from './routes/metaRouter.js';
import errorHandler from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from '../docs/openapi.json' with { type: 'json' };


// singleton pattern
const createApp = () => {
    const app = express();
    
    // swagger
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

    // middleware PARSE JSON
    app.use(express.json());
    
    // middleware routes
    app.use("/", metaRouter);
    app.use("/api/trackers", trackerRouter);

    // JSON 404 for unmatched routes
    app.use((req, res) => {
        res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
    });

    // middleware error handler
    app.use(errorHandler);

    return app;
} 


export default createApp;
