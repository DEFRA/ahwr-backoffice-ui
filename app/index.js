import { createServer } from "./server.js";
import { auth } from "./auth/index.js";

let server;

const init = async () => {
  server = await createServer();
  await server.start();
  auth.initAuth();
};

process.on("unhandledRejection", async (err) => {
  await server.stop();
  server.logger.error(err, "unhandledRejection");
  process.exit(1);
});

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});

init();
