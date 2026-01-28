import Joi from "joi";
import { permissions } from "../../auth/permissions.js";

import { searchApplication } from "./search-application-handler.js";
import { searchClaim } from "./search-claim-handler.js";
import { searchHerd } from "./search-herd-handler.js";
import { searchPayment } from "./search-payment-handler.js";
import { searchAgreementMessages } from "./search-agreement-messages-handler.js";
import { searchClaimMessages } from "./search-claim-messages-handler.js";
import { searchAgreementLogs } from "./search-agreement-logs-handler.js";

const { support } = permissions;

const supportTemplate = "support";

const getSupportHandler = (_request, h) => {
  return h.view(supportTemplate);
};

const getSupportRoute = {
  method: "GET",
  path: "/support",
  options: {
    auth: {
      scope: [support],
    },
    handler: getSupportHandler,
  },
};

const postSupportRoute = {
  method: "POST",
  path: "/support",
  options: {
    auth: {
      scope: [support],
    },
    validate: {
      payload: Joi.alternatives().conditional(".action", {
        switch: [
          {
            is: searchApplication.action,
            then: searchApplication.validation,
          },
          {
            is: searchClaim.action,
            then: searchClaim.validation,
          },
          {
            is: searchHerd.action,
            then: searchHerd.validation,
          },
          {
            is: searchPayment.action,
            then: searchPayment.validation,
          },
          {
            is: searchAgreementMessages.action,
            then: searchAgreementMessages.validation,
          },
          {
            is: searchClaimMessages.action,
            then: searchClaimMessages.validation,
          },
          {
            is: searchAgreementLogs.action,
            then: searchAgreementLogs.validation,
          },
        ],
      }),
      failAction: async (request, h, error) => {
        const errors = error.details
          .map((receivedError) => {
            if (receivedError.type === "alternatives.any") {
              const action = request.payload.action;
              return { ...receivedError, message: `Action ${action} is not supported.` };
            }

            if (receivedError.message.includes(searchApplication.errorIdentifier)) {
              return searchApplication.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchClaim.errorIdentifier)) {
              return searchClaim.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchHerd.errorIdentifier)) {
              return searchHerd.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchPayment.errorIdentifier)) {
              return searchPayment.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchAgreementMessages.errorIdentifier)) {
              return searchAgreementMessages.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchClaimMessages.errorIdentifier)) {
              return searchClaimMessages.errorHandler(receivedError);
            }

            if (receivedError.message.includes(searchAgreementLogs.errorIdentifier)) {
              return searchAgreementLogs.errorHandler(receivedError);
            }

            return null;
          })
          .filter((formattedError) => formattedError !== null)
          .map((formattedError) => ({
            text: formattedError.message,
            key: formattedError.context.key,
            href: formattedError.href,
          }));

        return h.view(supportTemplate, { errors }).takeover();
      },
    },
    handler: async (request, h) => {
      const { action } = request.payload;
      if (action === searchApplication.action) {
        return searchApplication.handler(request, h);
      }
      if (action === searchClaim.action) {
        return searchClaim.handler(request, h);
      }
      if (action === searchHerd.action) {
        return searchHerd.handler(request, h);
      }
      if (action === searchPayment.action) {
        return searchPayment.handler(request, h);
      }
      if (action === searchAgreementMessages.action) {
        return searchAgreementMessages.handler(request, h);
      }
      if (action === searchClaimMessages.action) {
        return searchClaimMessages.handler(request, h);
      }
      if (action === searchAgreementLogs.action) {
        return searchAgreementLogs.handler(request, h);
      }
    },
  },
};

export const supportRoutes = [getSupportRoute, postSupportRoute];
