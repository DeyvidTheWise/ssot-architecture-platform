import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initializeWebsocketServer } from './websocket/socket-server';

const app = createApp();
const server = http.createServer(app);

initializeWebsocketServer(server);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${env.PORT}`);
});
