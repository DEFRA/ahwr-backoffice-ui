import { MatchersV3 } from "@pact-foundation/pact";

const { like, eachLike, string, regex } = MatchersV3;

// Only fields actually read by app/routes/models/claim-list.js are asserted here -
// consumer-driven contract, not a full mirror of the provider's response shape.
// Example values are real, taken from a claim + its linked application in Test env
// (reference REBC-DN1M-HS6D / IAHW-5KHC-D7ZN).
export const claim = {
  reference: string("REBC-DN1M-HS6D"),
  status: string("IN_CHECK"),
  type: regex(/^(REVIEW|FOLLOW_UP)$/, "REVIEW"),
  createdAt: string("2026-07-29T10:55:12.634Z"),
  data: like({ typeOfLivestock: string("beef") }),
  herd: like({ name: string("Beef Herd"), cph: string("11/222/3333") }),
  application: like({
    flags: eachLike(
      { id: string("278872ee-ecfa-4d5e-8087-0c0fd7c16ed8"), deleted: like(false) },
      0,
    ),
    organisation: like({ sbi: string("106821850") }),
  }),
};

export const claimWithNoLinkedApplication = {
  reference: string("REBC-DN1M-HS6D"),
  status: string("IN_CHECK"),
  type: regex(/^(REVIEW|FOLLOW_UP)$/, "REVIEW"),
  createdAt: string("2026-07-29T10:55:12.634Z"),
  data: like({ typeOfLivestock: string("beef") }),
  herd: like({ name: string("Beef Herd"), cph: string("11/222/3333") }),
  // No "organisation" key - this is what the backend returns for a claim whose
  // applicationReference doesn't resolve to a real application (AHWR-2059).
  application: like({
    flags: eachLike(
      { id: string("278872ee-ecfa-4d5e-8087-0c0fd7c16ed8"), deleted: like(false) },
      0,
    ),
  }),
};
