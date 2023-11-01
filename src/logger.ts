import { Logger, pino } from "pino";

const reqLogLevel = process.env.LEVEL ? process.env.LEVEL : "debug";
// const reqLogLevel = "debug";
// colorize
const loggerPino = pino({
  transport: {
    target: "pino-pretty",
  },
  level: reqLogLevel,
});

export let logger: any;

logger = loggerPino;
