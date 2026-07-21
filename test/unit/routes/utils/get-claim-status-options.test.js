import { STATUS } from "ffc-ahwr-common-library";
import {
  SEARCH_STATUS,
  getClaimStatusOptions,
} from "../../../../app/routes/utils/get-claim-status-options.js";

describe("getStatusOptions", () => {
  test("returns the claim status options in order", () => {
    const options = getClaimStatusOptions(SEARCH_STATUS.ALL);

    expect(options).toEqual([
      { value: SEARCH_STATUS.ALL, text: "All statuses", selected: true },
      { value: STATUS.AGREED, text: "Agreed", selected: false },
      { value: STATUS.WITHDRAWN, text: "Withdrawn", selected: false },
      { value: STATUS.IN_CHECK, text: "In check", selected: false },
      { value: STATUS.ACCEPTED, text: "Accepted", selected: false },
      { value: STATUS.NOT_AGREED, text: "Not agreed", selected: false },
      { value: STATUS.PAID, text: "Paid", selected: false },
      { value: STATUS.READY_TO_PAY, text: "Ready to pay", selected: false },
      { value: STATUS.REJECTED, text: "Rejected", selected: false },
      { value: STATUS.ON_HOLD, text: "On hold", selected: false },
      { value: STATUS.RECOMMENDED_TO_PAY, text: "Recommended to pay", selected: false },
      { value: STATUS.RECOMMENDED_TO_REJECT, text: "Recommended to reject", selected: false },
      { value: STATUS.AUTHORISED, text: "Authorised", selected: false },
      { value: STATUS.SENT_TO_FINANCE, text: "Sent to finance", selected: false },
      { value: STATUS.PAYMENT_HELD, text: "Payment held", selected: false },
    ]);
  });

  test("marks the given agreement type as selected", () => {
    const options = getClaimStatusOptions(STATUS.AGREED);

    expect(options.find((option) => option.selected)).toEqual({
      value: STATUS.AGREED,
      text: "Agreed",
      selected: true,
    });
  });
});
