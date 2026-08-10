import { MatchersV3 } from "@pact-foundation/pact";
import {
  livestockClaimWithApplicationNotFlagged,
  livestockClaimWithApplicationFlagged,
  livestockClaimWithApplicationNoHerd,
  poultryClaimWithApplicationNotFlagged,
  poultryClaimWithApplicationFlagged,
} from "../../data/claims.js";
import {
  provider as newProvider,
  advancedSearchForClaimsWithNoFilters,
} from "./provider/claims-search-endpoint.js";
import { triggerAdvancedSearchForClaimsWithNoFilters } from "./consumer/claims-search-trigger.js";

const { like, reify } = MatchersV3;

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
  test("total counts every claim, but only claims with a resolving application are returned", async () => {
    const provider = newProvider();

    provider
      .given(
        "7 claims exist: livestock and poultry each with a not-flagged application, a " +
          "flagged application, and no matching application, plus a livestock claim with a " +
          "resolving application but no herd",
        {
          livestockOrphanedClaim: {
            reference: "REBC-9999-ORPH",
            applicationReference: "IAHW-9999-NOPE",
          },
          poultryOrphanedClaim: {
            reference: "PORE-9999-ORPH",
            applicationReference: "POUL-9999-NOPE",
          },
        },
      )
      .uponReceiving("a request for advanced search for claims with no filters applied")
      .withRequest(advancedSearchForClaimsWithNoFilters)
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": like("application/json") },
        body: {
          claims: [
            livestockClaimWithApplicationNotFlagged,
            livestockClaimWithApplicationFlagged,
            livestockClaimWithApplicationNoHerd,
            poultryClaimWithApplicationNotFlagged,
            poultryClaimWithApplicationFlagged,
          ],
          total: like(7),
        },
      });

    await provider.executeTest(async () => {
      const result = await triggerAdvancedSearchForClaimsWithNoFilters();

      // The 2 claims with no matching application aren't included here - they're dropped by
      // the backend's join, even though they're still counted in total.
      expect(result.claims).toHaveLength(5);
      expect(result.claims[0].application.organisation.sbi).toEqual(
        reify(livestockClaimWithApplicationNotFlagged).application.organisation.sbi,
      );
      expect(result.claims[1].application.organisation.sbi).toEqual(
        reify(livestockClaimWithApplicationFlagged).application.organisation.sbi,
      );
      expect(result.claims[2].herd).toEqual({});
      expect(result.claims[3].application.organisation.sbi).toEqual(
        reify(poultryClaimWithApplicationNotFlagged).application.organisation.sbi,
      );
      expect(result.claims[4].application.organisation.sbi).toEqual(
        reify(poultryClaimWithApplicationFlagged).application.organisation.sbi,
      );
      expect(result.total).toEqual(7);
    });
  });
});
