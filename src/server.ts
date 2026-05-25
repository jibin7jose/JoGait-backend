import app from './app';
import dotenv from 'dotenv';
import { prisma } from './utils/prisma';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Check Database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the PostgreSQL database.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 JoGait Backend Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

bootstrap();
