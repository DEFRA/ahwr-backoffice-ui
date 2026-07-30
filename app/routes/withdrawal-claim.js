import joi from "joi";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";

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
      return h.view("withdrawal-claim", {
        reference,
        page,
        returnPage,
        backLink: viewClaimLink(reference, page, returnPage),
      });
    },
  },
};

export const withdrawalClaimPostRoute = {
  method: "POST",
  path: "/withdraw-claim/{reference}",
  options: {
    auth: { scope: [administrator] },
    validate: {
      params: joi.object({ reference: joi.string() }),
      payload: joi.object({
        ...returnParams,
        reasonForWithdrawal: joi.string().optional().allow(""),
        issueDiscovery: joi.string().optional().allow(""),
        withdrawalDetails: joi.string().optional().allow(""),
        crumb: joi.string().optional(),
      }),
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
