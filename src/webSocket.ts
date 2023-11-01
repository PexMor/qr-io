import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger";

export const wsServer = new WebSocketServer({ noServer: true });

type RemInfo = {
  host: string;
  port: number;
};
let connInfo = new Map<WebSocket, RemInfo>();
let clientSet = new Set<WebSocket>();

wsServer.on("close", (socket: WebSocket) => {
  logger.debug(`Server WS close`);
});

const obj2bin = (obj: any) => {
  const objAsJson = JSON.stringify(obj);
  const utf8 = new TextEncoder();
  const jsonBuffer = utf8.encode(objAsJson);
  return jsonBuffer;
};

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
      logger.debug(req);
      clientSet.add(client);
      const remAddress = req.socket.remoteAddress
        ? req.socket.remoteAddress
        : "unknown";
      const remPort = req.socket.remotePort ? req.socket.remotePort : -1;
      const remInfo: RemInfo = {
        host: remAddress,
        port: remPort,
      };
      connInfo.set(client, remInfo);
      logger.warn(remInfo);

      client.on("message", (data: any) => {
        let jdata = JSON.parse(data.toString("utf-8"));
        logger.debug(jdata);
        for (let ws_client of clientSet) {
          if (ws_client.readyState === WebSocket.OPEN) {
            const dataJsoned = JSON.stringify(jdata);
            ws_client.send(obj2bin(dataJsoned));
          } else {
            logger.info(`router.ws:readyState=${ws_client.readyState}`);
          }
        }
      });
      client.on("error", (data: any) => {
        logger.debug(data);
      });
      client.on("error", (data: any) => {
        const remInfo = connInfo.get(client);
        logger.debug(`WS close ${JSON.stringify(remInfo)}`);
        // msgDelegateInst.emit("disconnect");
        clientSet.delete(client);
        connInfo.delete(client);
      });
    }
  );
};
