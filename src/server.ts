import chalk from "chalk";
import { getNgrokUrl } from "./ngrok_util";
import { logger } from "./logger";
import { Request, Response } from "express";
// Basic express server
import express from "express";
// create logger for request processing
import morgan_logger from "morgan";
// use body parser
import "body-parser";
// use cors to allow cross domain requests
import cors from "cors";
import { createServer } from "http";
// import { Server } from "socket.io";
import bodyParser from "body-parser";
import { handleUpgrade } from "./webSocket";
import nunjucks from "nunjucks";

const externalUrl = await getNgrokUrl();
nunjucks.configure("public/views", { autoescape: false });

const configUrl = async () => {
  // Configure APP Url
  if (externalUrl) {
    return true;
  } else {
    logger.error(
      `Missing NGROK url, please run 'ngrok http 8080' in some terminal`
    );
    return false;
  }
};

let rc_url_set = await configUrl();
if (rc_url_set) {
  // Can start server
  const DEFAULT_PORT = 8080;
  const PORT = process.env.PORT
    ? parseInt(process.env.PORT) || DEFAULT_PORT
    : DEFAULT_PORT;
  const app = express();
  const exUrl = new URL(externalUrl);
  const wsUrl = externalUrl.startsWith("https:")
    ? `wss://${exUrl.host}`
    : `ws://${exUrl.host}`;

  app.use(cors());
  // morgan_logger: combined | dev
  app.use(morgan_logger("combined"));
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.use("/docs", express.static("docs"));
  app.use("/js", express.static("view/js"));
  app.get("/echo", (req, resp) => {
    resp.json(req.body);
  });
  app.get("/", (req, resp) => {
    const dataCfg = { mode: "auto-send", url: wsUrl };
    const html = nunjucks.render("index.html", {
      cfg: JSON.stringify(dataCfg),
    });
    resp.send(html);
  });
  app.all("*", function (req, res) {
    res.redirect("/");
  });

  const server = createServer(app);

  server.on("upgrade", handleUpgrade);
  server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}...`);
  });
}
