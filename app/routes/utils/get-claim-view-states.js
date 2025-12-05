import { STATUS } from "ffc-ahwr-common-library";
import { mapAuth } from "../../auth/map-auth.js";

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
  claimIsAgreed,
  withdraw,
  claimIsRecommendedToPay,
  approve,
  currentStatusEvent,
  claimIsRecommendedToReject,
  reject,
  name,
}) => {
  if (!isAdminOrAuthorisor) {
    return {
      withdrawAction: false,
      withdrawForm: false,
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
    };
  }

  const setByAnotherUser = statusWasSetByAnotherUser(currentStatusEvent, name);

  const withdrawAction = claimIsAgreed && withdraw === false;
  const withdrawForm = claimIsAgreed && withdraw === true;

  if (!setByAnotherUser) {
    return {
      withdrawAction,
      withdrawForm,
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

  return { withdrawAction, withdrawForm, authoriseAction, authoriseForm, rejectAction, rejectForm };
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
  status,
  withdraw,
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
  const claimIsInCheck = status === STATUS.IN_CHECK;
  const claimIsAgreed = status === STATUS.AGREED;
  const claimIsOnHold = status === STATUS.ON_HOLD;
  const claimIsRecommendedToPay = status === STATUS.RECOMMENDED_TO_PAY;
  const claimIsRecommendedToReject = status === STATUS.RECOMMENDED_TO_REJECT;

  const { withdrawAction, withdrawForm, authoriseAction, authoriseForm, rejectAction, rejectForm } =
    getAdminAndAuthoriserActions({
      isAdminOrAuthorisor,
      claimIsAgreed,
      withdraw,
      claimIsRecommendedToPay,
      approve,
      currentStatusEvent,
      claimIsRecommendedToReject,
      reject,
      name,
    });

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
    withdrawAction,
    withdrawForm,
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

export const getClaimViewStates = (request, status, currentStatusEvent) => {
  const {
    withdraw,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    updateStatus,
    updateVetsName,
    updateDateOfVisit,
    updateVetRCVSNumber,
    updateEligiblePiiRedaction,
  } = request.query;
  const { name } = request.auth.credentials.account;

  const { isAdministrator, isRecommender, isAuthoriser, isSuperAdmin } = mapAuth(request);

  request.logger?.info({
    isAdministrator,
    isRecommender,
    isAuthoriser,
    isSuperAdmin,
  });
  const admActions = getAdminActionsAvailable({
    isAdministrator,
    isAuthoriser,
    status,
    withdraw,
    isRecommender,
    moveToInCheck,
    recommendToPay,
    recommendToReject,
    approve,
    reject,
    currentStatusEvent,
    name,
  });

  const superAdmActions = superAdminActions(
    isSuperAdmin,
    status,
    updateStatus,
    updateVetsName,
    updateVetRCVSNumber,
    updateDateOfVisit,
    updateEligiblePiiRedaction,
  );

  return {
    ...admActions,
    ...superAdmActions,
  };
};

const statusWasSetByAnotherUser = (currentStatusEvent, name) => {
  return currentStatusEvent && name !== currentStatusEvent.updatedBy;
};

const superAdminActions = (
  isSuperAdmin,
  status,
  updateStatus,
  updateVetsName,
  updateVetRCVSNumber,
  updateDateOfVisit,
  updateEligiblePiiRedaction,
) => {
  const claimIsntPaidOrReadyToPay = ![STATUS.READY_TO_PAY, STATUS.PAID].includes(status);

  const updateStatusAction = isSuperAdmin && claimIsntPaidOrReadyToPay;
  const updateStatusForm = isSuperAdmin && updateStatus === true && claimIsntPaidOrReadyToPay;

  const updateVetsNameAction = isSuperAdmin;
  const updateVetsNameForm = isSuperAdmin && updateVetsName === true;

  const updateVetRCVSNumberAction = isSuperAdmin;
  const updateVetRCVSNumberForm = isSuperAdmin && updateVetRCVSNumber === true;

  const updateDateOfVisitAction = isSuperAdmin;
  const updateDateOfVisitForm = isSuperAdmin && updateDateOfVisit === true;

  const updateEligiblePiiRedactionAction = isSuperAdmin;
  const updateEligiblePiiRedactionForm = isSuperAdmin && updateEligiblePiiRedaction === true;

  return {
    updateStatusAction,
    updateStatusForm,
    updateVetsNameAction,
    updateVetsNameForm,
    updateVetRCVSNumberAction,
    updateVetRCVSNumberForm,
    updateDateOfVisitAction,
    updateDateOfVisitForm,
    updateEligiblePiiRedactionAction,
    updateEligiblePiiRedactionForm,
  };
};
