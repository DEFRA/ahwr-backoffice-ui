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

const actions = [
  searchApplication,
  searchClaim,
  searchHerd,
  searchPayment,
  searchAgreementMessages,
  searchClaimMessages,
  searchAgreementLogs,
];

const actionHandlers = actions.reduce((acc, { action, handler }) => {
  acc[action] = handler;
  return acc;
}, {});

const postSupportRoute = {
  method: "POST",
  path: "/support",
  options: {
    auth: {
      scope: [support],
    },
    validate: {
      payload: Joi.alternatives().conditional(".action", {
        switch: actions.map((actionHandler) => ({
          is: actionHandler.action,
          then: actionHandler.validation,
        })),
      }),
      failAction: async (request, h, error) => {
        const errors = error.details
          .map((receivedError) => {
            if (receivedError.type === "alternatives.any") {
              const action = request.payload.action;
              return { ...receivedError, message: `Action ${action} is not supported.` };
            }

            const match = actions.find((item) =>
              receivedError.message.includes(item.errorIdentifier),
            );

            if (match) {
              return match.errorHandler(receivedError);
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
      return actionHandlers[action](request, h);
    },
  },
};

export const supportRoutes = [getSupportRoute, postSupportRoute];
