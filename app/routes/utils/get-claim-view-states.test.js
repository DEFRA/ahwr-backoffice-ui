import { getClaimViewStates } from "./get-claim-view-states.js";
import { STATUS as status } from "ffc-ahwr-common-library";
import { permissions } from "../../auth/permissions.js";
import { config } from "../../config/index.js";
const { administrator, recommender, authoriser, user } = permissions;

jest.mock("../../config", () => ({
  config: {
    superAdmins: ["currentuser@test"],
    withdrawClaimEnabled: true,
  },
}));

const currentUser = "testUser";

const buildRequest = ({ scope, query = {}, username = "" }) => ({
  query,
  auth: {
    isAuthenticated: true,
    credentials: {
      account: { name: currentUser, username },
      scope: [scope],
    },
  },
});

const noPermissions = {
  withdrawAction: false,
  moveToInCheckAction: false,
  moveToInCheckForm: false,
  recommendAction: false,
  recommendToPayForm: false,
  recommendToRejectForm: false,
  authoriseAction: false,
  authoriseForm: false,
  rejectAction: false,
  rejectForm: false,
  updateStatusAction: false,
  updateStatusForm: false,
  updateDateOfVisitAction: false,
  updateDateOfVisitForm: false,
  updateEligiblePiiRedactionAction: false,
  updateEligiblePiiRedactionForm: false,
  updateVetRCVSNumberAction: false,
  updateVetRCVSNumberForm: false,
  updateVetsNameAction: false,
  updateVetsNameForm: false,
};

const changeDataActions = {
  updateDateOfVisitAction: true,
  updateVetRCVSNumberAction: true,
  updateVetsNameAction: true,
};

describe("getClaimViewStates", () => {
  describe("user: admin", () => {
    test("no claim status", () => {
      const request = buildRequest({ scope: administrator });
      const state = getClaimViewStates({ request });

      expect(state).toEqual(noPermissions);
    });

    test("status: on hold", () => {
      const request = buildRequest({ scope: administrator, query: { moveToInCheck: false } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckAction: true,
      });
    });

    test("status: on hold, query: moveToInCheck", () => {
      const request = buildRequest({ scope: administrator, query: { moveToInCheck: true } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckForm: true,
      });
    });

    test("status: in check", () => {
      const request = buildRequest({
        scope: administrator,
        query: { recommendToPay: false, recommendToReject: false },
      });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({
        ...noPermissions,
        recommendAction: true,
      });
    });

    test("status: in check, query: recommendToPay", () => {
      const request = buildRequest({ scope: administrator, query: { recommendToPay: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({
        ...noPermissions,
        recommendToPayForm: true,
      });
    });

    test("status: in check, query: recommendToReject", () => {
      const request = buildRequest({ scope: administrator, query: { recommendToReject: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({ ...noPermissions, recommendToRejectForm: true });
    });

    test("status: in recommended to pay, recommender: different person", () => {
      const request = buildRequest({ scope: administrator, query: { approve: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual({ ...noPermissions, authoriseAction: true });
    });

    test("status: in recommended to pay, recommender: same person", () => {
      const request = buildRequest({ scope: administrator, query: { approve: false } });
      const currentStatusEvent = {
        updatedBy: currentUser,
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to pay, query: approve, recommender: different person", () => {
      const request = buildRequest({ scope: administrator, query: { approve: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        authoriseForm: true,
      });
    });

    test("status: in recommended to reject, recommender: different person", () => {
      const request = buildRequest({ scope: administrator, query: { reject: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        rejectAction: true,
      });
    });

    test("status: in recommended to reject, recommender: same person", () => {
      const request = buildRequest({ scope: administrator, query: { reject: false } });
      const currentStatusEvent = {
        updatedBy: currentUser,
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to reject, query: reject, recommender: different person", () => {
      const request = buildRequest({ scope: administrator, query: { reject: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        rejectForm: true,
      });
    });

    test("status: in recommended to reject, query: reject, recommender: same person", () => {
      const request = buildRequest({ scope: administrator, query: { reject: true } });
      const currentStatusEvent = {
        updatedBy: currentUser,
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("statusUpdateAction, claimStatus: any", () => {
      const request = buildRequest({
        scope: administrator,
        query: { updateStatus: false },
        username: "notSuperAdmin@test",
      });

      const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

      expect(state).toEqual(noPermissions);
    });

    test("statusUpdateForm, claimStatus: any, query: update", () => {
      const request = buildRequest({
        scope: administrator,
        query: { update: true },
        username: "notSuperAdmin@test",
      });

      const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

      expect(state).toEqual(noPermissions);
    });
  });

  describe("user: recommender", () => {
    test("no claim status", () => {
      const request = buildRequest({ scope: recommender });
      const state = getClaimViewStates({ request });

      expect(state).toEqual(noPermissions);
    });

    test("status: on hold", () => {
      const request = buildRequest({ scope: recommender, query: { moveToInCheck: false } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckAction: true,
      });
    });

    test("status: on hold, query: moveToInCheck", () => {
      const request = buildRequest({ scope: recommender, query: { moveToInCheck: true } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckForm: true,
      });
    });

    test("status: in check", () => {
      const request = buildRequest({
        scope: recommender,
        query: { recommendToPay: false, recommendToReject: false },
      });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({
        ...noPermissions,
        recommendAction: true,
      });
    });

    test("status: in check, query: recommendToPay", () => {
      const request = buildRequest({ scope: recommender, query: { recommendToPay: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({ ...noPermissions, recommendToPayForm: true });
    });

    test("status: in check, query: recommendToReject", () => {
      const request = buildRequest({ scope: recommender, query: { recommendToReject: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual({
        ...noPermissions,
        recommendToRejectForm: true,
      });
    });

    test("status: in recommended to pay, recommender: different person", () => {
      const request = buildRequest({ scope: recommender, query: { approve: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to pay, query: approve, recommender: different person", () => {
      const request = buildRequest({ scope: recommender, query: { approve: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to reject, recommender: different person", () => {
      const request = buildRequest({ scope: recommender, query: { reject: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to reject, query: reject, recommender: different person", () => {
      const request = buildRequest({ scope: recommender, query: { reject: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual(noPermissions);
    });
  });

  describe("user: authoriser", () => {
    test("no claim status", () => {
      const request = buildRequest({ scope: authoriser });
      const state = getClaimViewStates({ request });

      expect(state).toEqual(noPermissions);
    });

    test("status: on hold", () => {
      const request = buildRequest({ scope: authoriser, query: { moveToInCheck: false } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckAction: true,
      });
    });

    test("status: on hold, query: moveToInCheck", () => {
      const request = buildRequest({ scope: authoriser, query: { moveToInCheck: true } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual({
        ...noPermissions,
        moveToInCheckForm: true,
      });
    });

    test("status: in check", () => {
      const request = buildRequest({
        scope: authoriser,
        query: { recommendToPay: false, recommendToReject: false },
      });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual(noPermissions);
    });

    test("status: in check, query: recommendToPay", () => {
      const request = buildRequest({ scope: authoriser, query: { recommendToPay: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual(noPermissions);
    });

    test("status: in check, query: recommendToReject", () => {
      const request = buildRequest({ scope: authoriser, query: { recommendToReject: true } });
      const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

      expect(state).toEqual(noPermissions);
    });

    test("status: in recommended to pay, recommender: different person", () => {
      const request = buildRequest({ scope: authoriser, query: { approve: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        authoriseAction: true,
      });
    });

    test("status: in recommended to pay, query: approve, recommender: different person", () => {
      const request = buildRequest({ scope: authoriser, query: { approve: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_PAY,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        authoriseForm: true,
      });
    });

    test("status: in recommended to reject, recommender: different person", () => {
      const request = buildRequest({ scope: authoriser, query: { reject: false } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        rejectAction: true,
      });
    });

    test("status: in recommended to reject, query: reject, recommender: different person", () => {
      const request = buildRequest({ scope: authoriser, query: { reject: true } });
      const currentStatusEvent = {
        updatedBy: "someone else",
      };
      const state = getClaimViewStates({
        request,
        claimStatus: status.RECOMMENDED_TO_REJECT,
        currentStatusEvent,
      });

      expect(state).toEqual({
        ...noPermissions,
        rejectForm: true,
      });
    });
  });

  describe("user: user", () => {
    test("status: on hold", () => {
      const request = buildRequest({ scope: user, query: { moveToInCheck: false } });
      const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

      expect(state).toEqual(noPermissions);
    });
  });

  describe("user: super admin", () => {
    test("no claim status", () => {
      const request = buildRequest({
        scope: administrator,
        username: "currentUser@test",
      });

      const state = getClaimViewStates({ request });

      expect(state).toEqual({
        ...noPermissions,
        ...changeDataActions,
        updateStatusAction: true,
        updateEligiblePiiRedactionAction: true,
      });
    });

    test("statusUpdateAction, claimStatus: any", () => {
      const request = buildRequest({
        scope: administrator,
        query: { updateStatus: false },
        username: "currentUser@test",
      });

      const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

      expect(state).toEqual({
        ...noPermissions,
        ...changeDataActions,
        updateStatusAction: true,
        updateEligiblePiiRedactionAction: true,
      });
    });

    test("statusUpdateForm, claimStatus: any, query: updateStatus", () => {
      const request = buildRequest({
        scope: administrator,
        query: { updateStatus: true },
        username: "currentUser@test",
      });

      const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

      expect(state).toEqual({
        ...noPermissions,
        ...changeDataActions,
        updateStatusAction: true,
        updateStatusForm: true,
        updateEligiblePiiRedactionAction: true,
      });
    });

    test("statusUpdateForm, claimStatus: ready to pay, query: updateStatus", () => {
      const request = buildRequest({
        scope: administrator,
        query: { updateStatus: true },
        username: "currentUser@test",
      });

      const state = getClaimViewStates({ request, claimStatus: status.READY_TO_PAY });

      expect(state).toEqual({
        ...noPermissions,
        ...changeDataActions,
        updateEligiblePiiRedactionAction: true,
      });
    });
  });
});

describe("withdraw button", () => {
  const inCheckSuperAdminRequest = buildRequest({
    scope: administrator,
    query: { recommendToPay: false, recommendToReject: false },
    username: "currentUser@test",
  });

  afterEach(() => {
    config.withdrawClaimEnabled = true;
  });

  test("withdrawAction: true when super admin, status in check and toggle enabled", () => {
    const state = getClaimViewStates({
      request: inCheckSuperAdminRequest,
      claimStatus: status.IN_CHECK,
    });

    expect(state.withdrawAction).toBe(true);
  });

  test("withdrawAction: false when toggle disabled", () => {
    config.withdrawClaimEnabled = false;

    const state = getClaimViewStates({
      request: inCheckSuperAdminRequest,
      claimStatus: status.IN_CHECK,
    });

    expect(state.withdrawAction).toBe(false);
  });

  test("withdrawAction: false when super admin but status is not in check", () => {
    const state = getClaimViewStates({
      request: inCheckSuperAdminRequest,
      claimStatus: status.READY_TO_PAY,
    });

    expect(state.withdrawAction).toBe(false);
  });

  test("withdrawAction: false when the application is flagged", () => {
    const isFlagged = true;

    const state = getClaimViewStates({
      request: inCheckSuperAdminRequest,
      claimStatus: status.IN_CHECK,
      currentStatusEvent: undefined,
      formFlags: inCheckSuperAdminRequest.query,
      isFlagged,
    });

    expect(state.withdrawAction).toBe(false);
  });

  test("withdrawAction: false when status in check but user is not a super admin", () => {
    const request = buildRequest({
      scope: administrator,
      query: { recommendToPay: false, recommendToReject: false },
      username: "notSuperAdmin@test",
    });

    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state.withdrawAction).toBe(false);
  });
});
