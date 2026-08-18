import { config } from "dotenv";

// eslint-disable-next-line sonarjs/no-hardcoded-passwords -- test-only dummy value, long enough to satisfy the 32 character minimum
process.env.COOKIE_PASSWORD = "not-a-secret-cookie-password-for-tests-only";
// keep pino on ecs under test: a pino-pretty transport leaks a thread-stream worker
process.env.USE_PRETTY_PRINT = "false";

config();
