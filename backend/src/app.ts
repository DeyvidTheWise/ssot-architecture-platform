import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.use('/api', apiRoutes);

  app.use(errorMiddleware);

  return app;
};
