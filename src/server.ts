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
import fs from "fs";
import path from "path";
import { homedir } from "os";
import Multer from "multer";

// const tmpDir = "./tmp";
const externalUrl = await getNgrokUrl();
const tmpDir = path.join(homedir(), "tmp", "qr-io");
try {
  fs.mkdirSync(tmpDir, { recursive: true });
} catch (err) {
  console.error(err);
}
nunjucks.configure("public/views", { autoescape: false });
const upload = Multer({ dest: tmpDir });

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
  const postUrl = externalUrl.startsWith("https:")
    ? `https://${exUrl.host}/post`
    : `http://${exUrl.host}/post`;

  app.use(cors({ credentials: true, origin: true }));
  // morgan_logger: combined | dev
  app.use(morgan_logger("combined"));
  app.use(express.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(express.static("public"));

  app.use("/docs", express.static("docs"));
  app.use("/js", express.static("view/js"));
  app.get("/echo", (req, resp) => {
    resp.json(req.body);
  });
  app.post("/post", upload.single("image"), (req, resp) => {
    logger.debug(req);
    logger.debug(req.file);
    if (req.file) {
      const destFn = path.join(tmpDir, req.file.originalname);
      fs.rename(req.file.path, destFn, function (err) {
        if (err) {
          console.log("ERROR: " + err);
        } else {
          logger.debug(
            `File written successfully ${destFn} (${req.file?.size} Bytes)`
          );
        }
      });
    }
    // logger.debug(req.image);
    //logger.debug(req.image);//Object.keys(req.body));
    // const destFn = path.join(tmpDir, "save.jpg");
    // fs.writeFile(destFn, req.body.bin, (err) => {
    //   if (err) console.log(err);
    //   else {
    //     logger.debug(
    //       `File written successfully ${destFn} (${req.body.bin.length} Bytes)`
    //     );
    //   }
    // });
    resp.json({ rc: 0, msg: "ok" });
  });
  app.get("/", (req, resp) => {
    const dataCfgWS = { mode: "auto-send", url: wsUrl };
    const dataCfgPost = { mode: "auto-send", url: postUrl };
    const subst = {
      cfgWS: JSON.stringify(dataCfgWS),
      cfgPost: JSON.stringify(dataCfgPost),
    };
    logger.debug(subst);
    const html = nunjucks.render("index.html", subst);
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
