import joi from "joi";
import { StatusCodes } from "http-status-codes";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";

const { administrator } = permissions;

const viewClaimLink = (reference, page, returnPage) => {
  const query = new URLSearchParams({ page });
  if (returnPage) {
    query.append("returnPage", returnPage);
  }
  return `/view-claim/${reference}?${query.toString()}`;
};

// These are pass through from the view-claims page
const returnParams = {
  page: joi.string().default("1").allow(null, ""),
  returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
};

const withdrawalFields = ["reasonForWithdrawal", "issueDiscovery", "withdrawalDetails"];

const renderWithdrawalPage = (h, { reference, page, returnPage, values = {}, errors = [] }) =>
  h.view("withdrawal-claim", {
    reference,
    page,
    returnPage,
    backLink: viewClaimLink(reference, page, returnPage),
    errors,
    errorMessages: getErrorMessagesByKey(errors),
    ...values,
  });

const formatWithdrawalErrors = (details) =>
  details.map(({ message, context }) => ({
    text: message,
    href: `#${context.key}`,
    key: context.key,
  }));

export const withdrawalClaimGetRoute = {
  method: "GET",
  path: "/withdraw-claim/{reference}",
  options: {
    auth: { scope: [administrator] },
    validate: {
      params: joi.object({ reference: joi.string() }),
      query: joi.object(returnParams),
    },
    handler: (request, h) => {
      const { reference } = request.params;
      const { page, returnPage } = request.query;
      return renderWithdrawalPage(h, { reference, page, returnPage });
    },
  },
};

const requiredSelection = (message) =>
  joi.string().required().messages({ "any.required": message, "string.empty": message });

export const withdrawalClaimPostRoute = {
  method: "POST",
  path: "/withdraw-claim/{reference}",
  options: {
    auth: { scope: [administrator] },
    validate: {
      options: { abortEarly: false },
      params: joi.object({ reference: joi.string() }),
      payload: joi.object({
        ...returnParams,
        reasonForWithdrawal: requiredSelection("Select a reason for withdrawal"),
        issueDiscovery: requiredSelection("Select how the issue was discovered"),
        withdrawalDetails: requiredSelection("Enter details on why this claim should be withdrawn"),
        crumb: joi.string().optional(),
      }),
      failAction: (request, h, error) => {
        const { reference } = request.params;
        const { page, returnPage } = request.payload;
        request.logger.error({ error, reference });

        return renderWithdrawalPage(h, {
          reference,
          page,
          returnPage,
          values: Object.fromEntries(
            withdrawalFields.map((field) => [field, request.payload[field]]),
          ),
          errors: formatWithdrawalErrors(error.details),
        })
          .code(StatusCodes.BAD_REQUEST)
          .takeover();
      },
    },
    handler: async (request, h) => {
      const { reference } = request.params;
      const { page, returnPage } = request.payload;
      await generateNewCrumb(request, h);
      return h.redirect(viewClaimLink(reference, page, returnPage));
    },
  },
};

export const withdrawalClaimRoutes = [withdrawalClaimGetRoute, withdrawalClaimPostRoute];
