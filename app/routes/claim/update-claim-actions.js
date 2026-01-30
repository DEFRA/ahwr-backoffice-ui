import { encodeErrorsForUI } from "../utils/encode-errors-for-ui.js";
import { generateNewCrumb } from "../utils/crumb-cache.js";
import { updateClaimStatus } from "../../api/claims.js";

export const updateClaimFailAction = (request, h, error, errorHref, searchParam) => {
  const { page, reference, returnPage } = request.payload;
  request.logger.error({ error, reference });

  const errors = encodeErrorsForUI(error.details, errorHref);

  const query = new URLSearchParams({
    page,
    [searchParam]: "true",
    errors,
  });
  query.append("returnPage", returnPage);

  return h.redirect(`/view-claim/${reference}?${query.toString()}`).takeover();
};

export const updateClaimHandler = async (request, h, status) => {
  const { page, reference, returnPage, note } = request.payload;
  const { name } = request.auth.credentials.account;

  // TODO - look at removing setBindings here
  request.logger.setBindings({ reference });

  await generateNewCrumb(request, h);

  const query = new URLSearchParams({ page });
  query.append("returnPage", returnPage);

  await updateClaimStatus(reference, name, status, request.logger, note);

  return h.redirect(`/view-claim/${reference}?${query.toString()}`);
};
