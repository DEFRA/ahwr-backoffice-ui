import { MatchersV3 } from "@pact-foundation/pact";
import { claim, claimWithNoLinkedApplication } from "../../data/claims.js";
import { newProvider, advancedSearchWithNoFilters } from "./provider/claims-search-endpoint.js";
import { triggerClaimsAdvancedSearchWithNoFilters } from "./consumer/claims-search-trigger.js";

const { like, eachLike } = MatchersV3;

// jest.mock factories can't reference values imported from elsewhere in this file -
// Babel hoists this call above all imports, so the port must be a literal here, kept
// in sync with MOCK_PACT_PORT in provider/claims-search-endpoint.js rather than shared via import.
jest.mock("../../../../app/config/index.js", () => {
  const actual = jest.requireActual("../../../../app/config/index.js");
  return {
    config: {
      ...actual.config,
      applicationApiUri: "http://127.0.0.1:8992",
      apiKeys: { ...actual.config.apiKeys, backofficeUiApiKey: "pact-test-api-key" },
    },
  };
});

describe("getClaims contract with ahwr-application-backend", () => {
  test("returns a claim with its linked application data", async () => {
    const provider = newProvider();

    provider
      .uponReceiving("an advanced search with no filters applied")
      .withRequest(advancedSearchWithNoFilters)
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": like("application/json") },
        body: {
          claims: eachLike(claim),
          total: like(1),
        },
      });

    await provider.executeTest(async () => {
      const result = await triggerClaimsAdvancedSearchWithNoFilters();
      expect(result.claims[0].application.organisation.sbi).toEqual("106821850");
      expect(result.total).toEqual(1);
    });
  });

  test("returns a claim with no application data when its application reference is broken", async () => {
    const provider = newProvider();

    provider
      .uponReceiving(
        "an advanced search with no filters applied, where a claim's application reference is broken",
      )
      .withRequest(advancedSearchWithNoFilters)
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": like("application/json") },
        body: {
          claims: eachLike(claimWithNoLinkedApplication),
          total: like(1),
        },
      });

    await provider.executeTest(async () => {
      const result = await triggerClaimsAdvancedSearchWithNoFilters();
      expect(result.claims[0].application.organisation).toBeUndefined();
      expect(result.total).toEqual(1);
    });
  });
});
