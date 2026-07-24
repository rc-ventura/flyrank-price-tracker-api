import createApp from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

const app = createApp();
const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});