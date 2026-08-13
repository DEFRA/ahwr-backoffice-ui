import { config } from "dotenv";

// keep pino on ecs under test: a pino-pretty transport leaks a thread-stream worker
process.env.USE_PRETTY_PRINT = "false";

config();
