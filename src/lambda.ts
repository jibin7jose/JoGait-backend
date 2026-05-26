import serverlessExpress from '@vendia/serverless-express';
import app from './app';
import { prisma } from './utils/prisma';

// Ensure the database connection is initialized once per Lambda container lifecycle
let connected = false;

const setupDb = async () => {
  if (!connected) {
    await prisma.$connect();
    connected = true;
    console.log('Serverless: Connected to PostgreSQL RDS');
  }
};

export const handler = async (event: any, context: any, callback: any) => {
  await setupDb();
  const server = serverlessExpress({ app });
  return server(event, context, callback);
};
