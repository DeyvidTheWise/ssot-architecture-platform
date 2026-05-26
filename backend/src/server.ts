import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initializeWebsocket } from "./websocket/server";

const app = createApp();
const httpServer = createServer(app);

initializeWebsocket(httpServer);

httpServer.listen(env.PORT, () => {
  process.stdout.write(`Backend server listening on port ${env.PORT}\n`);
});