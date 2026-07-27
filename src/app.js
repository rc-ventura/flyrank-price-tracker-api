import express from 'express';
import trackerRouter from './routes/trackerRouter.js';
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
    app.use("/api/trackers", trackerRouter);

    // middleware error handler
    app.use(errorHandler);

    return app;
} 


export default createApp;
