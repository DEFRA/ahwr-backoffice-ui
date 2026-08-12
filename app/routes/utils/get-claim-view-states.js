import { STATUS } from "ffc-ahwr-common-library";
import { mapAuth } from "../../auth/map-auth.js";
import { canWithdrawClaim } from "./can-withdraw-claim.js";

const getAdminAndRecommenderActions = ({
  isAdminOrRecommender,
  claimIsInCheck,
  recommendToPay,
  recommendToReject,
}) => {
  if (!isAdminOrRecommender) {
    return { recommendAction: false, recommendToPayForm: false, recommendToRejectForm: false };
  }

  const recommendAction = claimIsInCheck && recommendToPay === false && recommendToReject === false;

  const recommendToPayForm = claimIsInCheck && recommendToPay === true;

  const recommendToRejectForm = claimIsInCheck && recommendToReject === true;

  return { recommendAction, recommendToPayForm, recommendToRejectForm };
};

const getAdminAndAuthoriserActions = ({
  isAdminOrAuthorisor,
  claimIsRecommendedToPay,
  approve,
  currentStatusEvent,
  claimIsRecommendedToReject,
  reject,
  name,
}) => {
  if (!isAdminOrAuthorisor) {
    return {
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
    };
  }

  const setByAnotherUser = statusWasSetByAnotherUser(currentStatusEvent, name);

  if (!setByAnotherUser) {
    return {
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
    };
  }

  const authoriseAction = claimIsRecommendedToPay && approve === false;

  const authoriseForm = claimIsRecommendedToPay && approve === true;

  const rejectAction = claimIsRecommendedToReject && reject === false;

  const rejectForm = claimIsRecommendedToReject && reject === true;

  return { authoriseAction, authoriseForm, rejectAction, rejectForm };
};

const getAdminAndAuthoriserAndRecommenderActions = ({
  isAdminOrAuthorisorOrRecommender,
  claimIsOnHold,
  moveToInCheck,
}) => {
  if (!isAdminOrAuthorisorOrRecommender) {
    return { moveToInCheckAction: false, moveToInCheckForm: false };
  }

  const moveToInCheckAction = claimIsOnHold && moveToInCheck === false;

  const moveToInCheckForm = claimIsOnHold && moveToInCheck === true;

  return { moveToInCheckAction, moveToInCheckForm };
};

const getAdminActionsAvailable = ({
  isAdministrator,
  isAuthoriser,
  claimStatus,
  isRecommender,
  moveToInCheck,
  recommendToPay,
  recommendToReject,
  approve,
  reject,
  currentStatusEvent,
  name,
}) => {
  const isAdminOrAuthorisor = isAdministrator || isAuthoriser;
  const isAdminOrRecommender = isAdministrator || isRecommender;
  const isAdminOrAuthorisorOrRecommender = isAdministrator || isAuthoriser || isRecommender;
  const claimIsInCheck = claimStatus === STATUS.IN_CHECK;
  const claimIsOnHold = claimStatus === STATUS.ON_HOLD;
  const claimIsRecommendedToPay = claimStatus === STATUS.RECOMMENDED_TO_PAY;
  const claimIsRecommendedToReject = claimStatus === STATUS.RECOMMENDED_TO_REJECT;

  const { authoriseAction, authoriseForm, rejectAction, rejectForm } = getAdminAndAuthoriserActions(
    {
      isAdminOrAuthorisor,
      claimIsRecommendedToPay,
      approve,
      currentStatusEvent,
      claimIsRecommendedToReject,
      reject,
      name,
    },
  );

  const { recommendAction, recommendToPayForm, recommendToRejectForm } =
    getAdminAndRecommenderActions({
      isAdminOrRecommender,
      claimIsInCheck,
      recommendToPay,
      recommendToReject,
    });

  const { moveToInCheckAction, moveToInCheckForm } = getAdminAndAuthoriserAndRecommenderActions({
    isAdminOrAuthorisorOrRecommender,
    claimIsOnHold,
    moveToInCheck,
  });

  return {
    moveToInCheckAction,
    moveToInCheckForm,
    recommendAction,
    recommendToPayForm,
    recommendToRejectForm,
    authoriseAction,
    authoriseForm,
    rejectAction,
    rejectForm,
  };
};

/**
 * This represents the default flags for actions allowed
 */
export const DEFAULT_FORM_FLAGS = {
  moveToInCheck: false,
  recommendToPay: false,
  recommendToReject: false,
  approve: false,
  reject: false,
  updateStatus: false,
  updateVetsName: false,
  updateDateOfVisit: false,
  updateVetRCVSNumber: false,
  updateEligiblePiiRedaction: false,
};

/**
 * Determines which action buttons and inline forms a caseworker sees on a claim or
 * agreement view, from their role, the claim status, and which form they have opened.
 *
 * Application/agreement views omit `claimStatus`: no claim-status-driven action applies
 * there, and the super-admin data-edit actions key off role alone.
 *
 * @param {object} params
 * @param {object} params.request - the Hapi request; supplies the authenticated account
 *   (`request.auth.credentials.account`) and the default form flags (`request.query`).
 * @param {string} [params.claimStatus] - the claim's current status (a `STATUS` value).
 * @param {{ updatedBy: string } | null} [params.currentStatusEvent] - the most recent
 *   status-change event; stops a user authorising or rejecting a claim they last updated.
 * @param {object} [params.formFlags=request.query] - booleans for which inline form is
 *   open; see {@link DEFAULT_FORM_FLAGS}.
 * @param {boolean} [params.isFlagged=false] - whether the application is flagged; blocks withdrawal.
 * @returns {Object<string, boolean>} the view-state flags (e.g. `moveToInCheckAction`,
 *   `authoriseForm`, `withdrawAction`, `updateVetsNameForm`) consumed by the templates.
 */
export const getClaimViewStates = ({
  request,
  claimStatus,
  currentStatusEvent,
  formFlags = request.query,
  isFlagged = false,
}) => {
  const {
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    updateStatus,
    updateVetsName,
    updateDateOfVisit,
    updateVetRCVSNumber,
  } = formFlags;
  const { name } = request.auth.credentials.account;

  const { isAdministrator, isRecommender, isAuthoriser, isSuperAdmin } = mapAuth(request);

  const adminActions = getAdminActionsAvailable({
    isAdministrator,
    isAuthoriser,
    claimStatus,
    isRecommender,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    currentStatusEvent,
    name,
  });

  const superAdminActions = superAdminActionsAvailable(isSuperAdmin, claimStatus, isFlagged, {
    updateStatus,
    updateVetsName,
    updateVetRCVSNumber,
    updateDateOfVisit,
  });

  return {
    ...adminActions,
    ...superAdminActions,
  };
};

const statusWasSetByAnotherUser = (currentStatusEvent, name) => {
  return currentStatusEvent && name !== currentStatusEvent.updatedBy;
};

const superAdminActionsAvailable = (isSuperAdmin, claimStatus, isFlagged, updateFlags) => {
  const { updateStatus, updateVetsName, updateVetRCVSNumber, updateDateOfVisit } = updateFlags;

  const claimIsntPaidOrReadyToPay = ![STATUS.READY_TO_PAY, STATUS.PAID].includes(claimStatus);

  const canChangeClaimData = ![STATUS.WITHDRAWN].includes(claimStatus) && isSuperAdmin;

  const withdrawAction = canWithdrawClaim({ isSuperAdmin, status: claimStatus, isFlagged });

  const updateStatusAction = canChangeClaimData && claimIsntPaidOrReadyToPay;
  const updateStatusForm = canChangeClaimData && updateStatus === true && claimIsntPaidOrReadyToPay;

  const updateVetsNameAction = canChangeClaimData;
  const updateVetsNameForm = canChangeClaimData && updateVetsName === true;

  const updateVetRCVSNumberAction = canChangeClaimData;
  const updateVetRCVSNumberForm = canChangeClaimData && updateVetRCVSNumber === true;

  const updateDateOfVisitAction = canChangeClaimData;
  const updateDateOfVisitForm = canChangeClaimData && updateDateOfVisit === true;

  return {
    withdrawAction,
    updateStatusAction,
    updateStatusForm,
    updateVetsNameAction,
    updateVetsNameForm,
    updateVetRCVSNumberAction,
    updateVetRCVSNumberForm,
    updateDateOfVisitAction,
    updateDateOfVisitForm,
  };
};
