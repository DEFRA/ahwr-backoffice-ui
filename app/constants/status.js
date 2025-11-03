const BLUE = "govuk-tag--blue";
const GREEN = "govuk-tag--green";
const GREY = "govuk-tag--grey";
const ORANGE = "govuk-tag--orange";
const PURPLE = "govuk-tag--purple";
const PINK = "govuk-tag--pink";
const RED = "govuk-tag--red";
const statusStyle = {
  APPLIED: {
    styleClass: GREEN,
  },
  AGREED: {
    styleClass: GREEN,
  },
  WITHDRAWN: {
    styleClass: GREY,
  },
  PAID: {
    styleClass: BLUE,
  },
  REJECTED: {
    styleClass: RED,
  },
  NOT_AGREED: {
    styleClass: PINK,
  },
  ACCEPTED: {
    styleClass: PURPLE,
  },
  CHECK: {
    styleClass: ORANGE,
  },
  CLAIMED: {
    styleClass: BLUE,
  },
  IN_CHECK: {
    styleClass: ORANGE,
  },
  RECOMMENDED_TO_PAY: {
    styleClass: ORANGE,
  },
  RECOMMENDED_TO_REJECT: {
    styleClass: ORANGE,
  },
  READY_TO_PAY: {
    styleClass: "govuk-tag",
  },
  ON_HOLD: {
    styleClass: PURPLE,
  },
};

export const getStyleClassByStatus = (rawStatus) => {
  if (rawStatus === undefined) {
    return ORANGE;
  }

  const matchedStatus = statusStyle[rawStatus];

  return matchedStatus?.styleClass ?? ORANGE;
};
