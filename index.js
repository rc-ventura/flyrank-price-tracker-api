import 'dotenv/config';
import createApp from './src/app.js';
import { initDb } from './db/tracker.db.js';

await initDb();

const app = createApp();
const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});