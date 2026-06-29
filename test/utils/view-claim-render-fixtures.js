import { getClaim, getClaims, getClaimHistory } from "../../app/api/claims.js";
import { getApplication } from "../../app/api/applications.js";
import { getClaimViewStates } from "../../app/routes/utils/get-claim-view-states.js";

const application = {
  reference: "IAHW-1234-APP1",
  organisation: {
    sbi: "113494460",
    name: "Test Farm Lodge",
    email: "farmer@example.test",
    orgEmail: "org@example.test",
    address: "WHITE HOUSE FARM,LEIGHTON BUZZARD,HR2 8AN,United Kingdom",
    farmerName: "Russell Davies",
  },
  createdAt: "2024-03-22T12:19:04.696Z",
  flags: [],
  redacted: false,
};

const claim = {
  reference: "FUSH-1010-2020",
  applicationReference: "IAHW-1234-APP1",
  type: "REVIEW",
  status: "IN_CHECK",
  createdAt: "2024-03-22T12:20:18.307Z",
  data: {
    typeOfLivestock: "sheep",
    dateOfVisit: "2024-03-22T00:00:00.000Z",
    vetsName: "Vet one",
    vetRCVSNumber: "1233211",
  },
};

// Wires up the mocks the shared claim view (buildViewClaim) needs so a failing
// claim-action POST can re-render the view in place. The caller must jest.mock
// app/api/claims, app/api/applications and the get-claim-view-states util.
export const setupViewClaimRender = () => {
  getClaim.mockReturnValue(claim);
  getClaims.mockReturnValue({ claims: [] });
  getClaimHistory.mockResolvedValue({ historyRecords: [] });
  getApplication.mockReturnValue(application);
  getClaimViewStates.mockReturnValue({});
};
