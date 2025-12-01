import { claimType } from "ffc-ahwr-common-library";

export const getReviewType = (typeOfReview) => {
  return {
    isReview: typeOfReview === claimType.review,
    isEndemicsFollowUp: typeOfReview === claimType.endemics,
  };
};
