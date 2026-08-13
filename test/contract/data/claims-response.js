import { MatchersV3 } from "@pact-foundation/pact";

const { like, eachLike, string } = MatchersV3;

const flag = { id: string("278872ee-ecfa-4d5e-8087-0c0fd7c16ed8"), deleted: like(false) };

export const livestockClaimWithApplicationNotFlagged = {
  reference: string("REBC-DN1M-HS6D"),
  status: string("IN_CHECK"),
  type: string("REVIEW"),
  createdAt: string("2026-08-05T10:55:12.634Z"),
  data: like({ typeOfLivestock: string("beef") }),
  herd: like({ name: string("Unflagged cattle herd"), cph: string("11/222/3333") }),
  application: like({
    flags: [],
    organisation: like({ sbi: string("106821850") }),
  }),
};

export const livestockClaimWithApplicationFlagged = {
  reference: string("REBC-DN1M-HS7D"),
  status: string("IN_CHECK"),
  type: string("REVIEW"),
  createdAt: string("2026-08-04T10:55:12.634Z"),
  data: like({ typeOfLivestock: string("beef") }),
  herd: like({ name: string("Flagged cattle herd"), cph: string("11/222/3233") }),
  application: like({
    flags: eachLike(flag, 1),
    organisation: like({ sbi: string("106821851") }),
  }),
};

export const livestockClaimWithApplicationNoHerd = {
  reference: string("REBC-DN1M-HS8D"),
  status: string("IN_CHECK"),
  type: string("REVIEW"),
  createdAt: string("2026-08-03T10:55:12.634Z"),
  data: like({ typeOfLivestock: string("beef") }),
  // Herd association is conditional on isMultipleHerdsUserJourney (dateOfVisit predates
  // MULTIPLE_HERDS_RELEASE_DATE, or the agreement has an appliesToMh opt-out) - when that's
  // false, claimHerdData defaults to {}, not a missing herd key. Livestock-only: poultry
  // claims always get a site (src/processing/claim/poultry/processor.js, site is required).
  herd: like({}),
  application: like({
    flags: [],
    organisation: like({ sbi: string("106821852") }),
  }),
};

export const poultryClaimWithApplicationNotFlagged = {
  reference: string("PORE-DJVR-7BJB"),
  status: string("IN_CHECK"),
  type: string("REVIEW"),
  createdAt: string("2026-08-02T14:20:10.742Z"),
  data: like({ typesOfPoultry: eachLike(string("ducks")) }),
  herd: like({ name: string("Unflagged Farm"), cph: string("12/345/6712") }),
  application: like({
    flags: [],
    organisation: like({ sbi: string("107234561") }),
  }),
};

export const poultryClaimWithApplicationFlagged = {
  reference: string("PORE-DJVR-6BJB"),
  status: string("IN_CHECK"),
  type: string("REVIEW"),
  createdAt: string("2026-08-01T14:20:10.742Z"),
  data: like({ typesOfPoultry: eachLike(string("geese")) }),
  herd: like({ name: string("Flagged Farm"), cph: string("12/345/6812") }),
  application: like({
    flags: eachLike(flag, 1),
    organisation: like({ sbi: string("107234562") }),
  }),
};
