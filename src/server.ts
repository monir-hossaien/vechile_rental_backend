
import app from './app';
import { CONFIG } from './config';
import { connectDB } from './config/db';
import { initAutoReturnJob } from './helpers/cronJobs';

const PORT = CONFIG.PORT || 8000;

connectDB().then(() => {
    console.log("Database connected successfully");
    
    initAutoReturnJob();
    console.log("Auto-return scheduler initialized.");

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
});