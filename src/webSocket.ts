import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger";

export const wsServer = new WebSocketServer({ noServer: true });

export const selectHandler = (
  clientSocket: WebSocket,
  req: IncomingMessage
) => {
  if (req.url) {
  } else {
    logger.error("req.url is falsy");
  }
};

wsServer.on("connection", selectHandler);
wsServer.on("close", (socket: WebSocket) => {
  logger.debug(`Server WS close`);
});

export const handleUpgrade = (
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer
) => {
  wsServer.handleUpgrade(
    request,
    socket,
    head,
    (client: WebSocket, req: IncomingMessage) => {
      const remAddress = req.socket.remoteAddress
        ? req.socket.remoteAddress
        : "unknown";
      logger.debug(req);
      logger.warn(remAddress);
      wsServer.emit("connection", client, req);
    }
  );
};
