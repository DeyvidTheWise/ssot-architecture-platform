import { type Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';

export const initializeWebsocketServer = (server: HttpServer): WebSocketServer => {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'connected' }));
  });
  return wss;
};
