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

describe("getClaimViewStates", () => {
  test("status: agreed, user: admin", () => {
    const request = {
      query: {
        withdraw: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request });

    expect(state).toEqual(noPermissions);
  });

  test("status: agreed, user: recommender", () => {
    const request = {
      query: {
        withdraw: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request });

    expect(state).toEqual(noPermissions);
  });

  test("status: agreed, user: authoriser", () => {
    const request = {
      query: {
        withdraw: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request });

    expect(state).toEqual(noPermissions);
  });

  test("status: on hold, user: admin", () => {
    const request = {
      query: {
        moveToInCheck: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckAction: true,
    });
  });

  test("status: on hold, user: recommender", () => {
    const request = {
      query: {
        moveToInCheck: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckAction: true,
    });
  });

  test("status: on hold, user: authoriser", () => {
    const request = {
      query: {
        moveToInCheck: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckAction: true,
    });
  });

  test("status: on hold, user: user", () => {
    const request = {
      query: {
        moveToInCheck: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [user],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual(noPermissions);
  });

  test("status: on hold, query: moveToInCheck, user: admin", () => {
    const request = {
      query: {
        moveToInCheck: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckForm: true,
    });
  });

  test("status: on hold, query: moveToInCheck, user: recommender", () => {
    const request = {
      query: {
        moveToInCheck: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckForm: true,
    });
  });

  test("status: on hold, query: moveToInCheck, user: authoriser", () => {
    const request = {
      query: {
        moveToInCheck: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.ON_HOLD });

    expect(state).toEqual({
      ...noPermissions,
      moveToInCheckForm: true,
    });
  });

  test("status: in check, user: admin", () => {
    const request = {
      query: {
        recommendToPay: false,
        recommendToReject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({
      ...noPermissions,
      recommendAction: true,
    });
  });

  test("status: in check, user: recommender", () => {
    const request = {
      query: {
        recommendToPay: false,
        recommendToReject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({
      ...noPermissions,
      recommendAction: true,
    });
  });

  test("status: in check, user: authoriser", () => {
    const request = {
      query: {
        recommendToPay: false,
        recommendToReject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual(noPermissions);
  });

  test("status: in check, query: recommendToPay, user: admin", () => {
    const request = {
      query: {
        recommendToPay: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({
      ...noPermissions,
      recommendToPayForm: true,
    });
  });

  test("status: in check, query: recommendToPay, user: recommender", () => {
    const request = {
      query: {
        recommendToPay: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({ ...noPermissions, recommendToPayForm: true });
  });

  test("status: in check, query: recommendToPay, user: authoriser", () => {
    const request = {
      query: {
        recommendToPay: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual(noPermissions);
  });

  test("status: in check, query: recommendToReject, user: admin", () => {
    const request = {
      query: {
        recommendToReject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({ ...noPermissions, recommendToRejectForm: true });
  });

  test("status: in check, query: recommendToReject, user: recommender", () => {
    const request = {
      query: {
        recommendToReject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual({
      ...noPermissions,
      recommendToRejectForm: true,
    });
  });

  test("status: in check, query: recommendToReject, user: authoriser", () => {
    const request = {
      query: {
        recommendToReject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state).toEqual(noPermissions);
  });

  test("status: in recommended to pay, user: admin, recommender: different person", () => {
    const request = {
      query: {
        approve: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
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

  test("status: in recommended to pay, user: admin, recommender: same person", () => {
    const request = {
      query: {
        approve: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
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

  test("status: in recommended to pay, user: recommender, recommender: different person", () => {
    const request = {
      query: {
        approve: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
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

  test("status: in recommended to pay, user: authoriser, recommender: different person", () => {
    const request = {
      query: {
        approve: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
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

  test("status: in recommended to pay, query: approve, user: admin, recommender: different person", () => {
    const request = {
      query: {
        approve: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
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

  test("status: in recommended to pay, query: approve, user: recommender, recommender: different person", () => {
    const request = {
      query: {
        approve: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
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

  test("status: in recommended to pay, query: approve, user: authoriser, recommender: different person", () => {
    const request = {
      query: {
        approve: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
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

  test("status: in recommended to reject, user: admin, recommender: different person", () => {
    const request = {
      query: {
        reject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const currentStatusEvent = {
      updatedBy: "someone else",
    };
    const state = getClaimViewStates({
      request,
      claimStatus: status.RECOMMENDED_TO_REJECT,
      currentStatusEvent,
    });

    expect(state).toEqual({
      withdrawAction: false,
      moveToInCheckAction: false,
      moveToInCheckForm: false,
      recommendAction: false,
      recommendToPayForm: false,
      recommendToRejectForm: false,
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: true,
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
    });
  });

  test("status: in recommended to reject, user: admin, recommender: same person", () => {
    const request = {
      query: {
        reject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
    const currentStatusEvent = {
      updatedBy: currentUser,
    };
    const state = getClaimViewStates({
      request,
      claimStatus: status.RECOMMENDED_TO_REJECT,
      currentStatusEvent,
    });

    expect(state).toEqual({
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
    });
  });

  test("status: in recommended to reject, user: recommender, recommender: different person", () => {
    const request = {
      query: {
        reject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
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

  test("status: in recommended to reject, user: authoriser, recommender: different person", () => {
    const request = {
      query: {
        reject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
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

  test("status: in recommended to reject, query: reject, user: admin, recommender: different person", () => {
    const request = {
      query: {
        reject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
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

  test("status: in recommended to reject, query: reject, user: admin, recommender: same person", () => {
    const request = {
      query: {
        reject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [administrator],
        },
      },
    };
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

  test("status: in recommended to reject, query: reject, user: recommender, recommender: different person", () => {
    const request = {
      query: {
        reject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [recommender],
        },
      },
    };
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

  test("status: in recommended to reject, query: reject, user: authoriser, recommender: different person", () => {
    const request = {
      query: {
        reject: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "" },
          scope: [authoriser],
        },
      },
    };
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

  test("statusUpdateAction, claimStatus: any, user: admin", () => {
    const request = {
      query: {
        updateStatus: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "notSuperAdmin@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

    expect(state).toEqual(noPermissions);
  });

  test("statusUpdateAction, claimStatus: any, user: admin & super admin", () => {
    const request = {
      query: {
        updateStatus: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "currentUser@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

    expect(state).toEqual({
      ...noPermissions,
      updateStatusAction: true,
      updateDateOfVisitAction: true,
      updateEligiblePiiRedactionAction: true,
      updateVetRCVSNumberAction: true,
      updateVetsNameAction: true,
    });
  });

  test("statusUpdateForm, claimStatus: any, query: update, user: admin", () => {
    const request = {
      query: {
        update: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "notSuperAdmin@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

    expect(state).toEqual(noPermissions);
  });

  test("statusUpdateForm, claimStatus: any, query: updateStatus, user: admin & super admin", () => {
    const request = {
      query: {
        updateStatus: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "currentUser@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.REJECTED });

    expect(state).toEqual({
      ...noPermissions,
      updateStatusAction: true,
      updateStatusForm: true,
      updateDateOfVisitAction: true,
      updateEligiblePiiRedactionAction: true,
      updateVetRCVSNumberAction: true,
      updateVetsNameAction: true,
    });
  });

  test("statusUpdateForm, claimStatus: ready to pay, query: updateStatus, user: admin & super admin", () => {
    const request = {
      query: {
        updateStatus: true,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "currentUser@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.READY_TO_PAY });

    expect(state).toEqual({
      ...noPermissions,
      updateDateOfVisitAction: true,
      updateEligiblePiiRedactionAction: true,
      updateVetRCVSNumberAction: true,
      updateVetsNameAction: true,
    });
  });
});

describe("withdraw button", () => {
  const inCheckSuperAdminRequest = {
    query: {
      recommendToPay: false,
      recommendToReject: false,
    },
    auth: {
      isAuthenticated: true,
      credentials: {
        account: { name: currentUser, username: "currentUser@test" },
        scope: [administrator],
      },
    },
  };

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
    const request = {
      query: {
        recommendToPay: false,
        recommendToReject: false,
      },
      auth: {
        isAuthenticated: true,
        credentials: {
          account: { name: currentUser, username: "notSuperAdmin@test" },
          scope: [administrator],
        },
      },
    };

    const state = getClaimViewStates({ request, claimStatus: status.IN_CHECK });

    expect(state.withdrawAction).toBe(false);
  });
});
