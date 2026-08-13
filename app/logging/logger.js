import { pino } from "pino";
import { loggerOptions } from "./logger-options.js";

let logger;

export function getLogger() {
  if (!logger) {
    logger = pino(loggerOptions);
  }
  return logger;
}
