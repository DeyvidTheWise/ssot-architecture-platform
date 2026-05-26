import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { apiRouter } from "./routes";

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
};