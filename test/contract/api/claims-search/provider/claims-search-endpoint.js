import path from "node:path";
import { PactV3, MatchersV3 } from "@pact-foundation/pact";

const { string } = MatchersV3;

export const MOCK_PACT_PORT = 8992;
export const MOCK_API_KEY = "pact-test-api-key";

export const provider = () =>
  new PactV3({
    consumer: "ahwr-backoffice-ui",
    provider: "ahwr-application-backend",
    port: MOCK_PACT_PORT,
    dir: path.resolve(process.cwd(), "pacts"),
  });

export const advancedSearchForClaimsWithNoFilters = {
  method: "POST",
  path: "/claims/search",
  headers: { "x-api-key": string(MOCK_API_KEY) },
  body: {
    search: { text: "", type: "" },
    limit: 20,
    offset: 0,
  },
};
