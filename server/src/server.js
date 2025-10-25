import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const app = createApp();

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 API on http://localhost:${port}`);
      console.log(`📁 Static uploads at http://localhost:${port}/uploads`);
    });
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
};

start();
