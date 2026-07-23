import express from 'express';
import dotenv from 'dotenv';
import taskRouter from './routes/taskRouter.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/tasks", taskRouter);

const PORT = process.env.PORT || 3000
app.listen(PORT, (error) => {
    if(error) {
        throw error;
    }
    console.log(`My first Express app - listening on port ${PORT}!`);
})