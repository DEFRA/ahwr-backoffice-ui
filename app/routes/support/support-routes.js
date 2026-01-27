import Joi from "joi";
import { permissions } from "../../auth/permissions.js";
import {
  getAgreementLogsDocument,
  getAgreementMessagesDocument,
  getApplicationDocument,
  getClaimDocument,
  getClaimMessagesDocument,
  getHerdDocument,
  getPaymentDocument,
} from "./support-calls.js";

const { support } = permissions;

const createView = async ({
  request,
  h,
  errors = undefined,
  applicationDocument = undefined,
  claimDocument = undefined,
  herdDocument = undefined,
  paymentDocument = undefined,
  agreementMessagesDocument = undefined,
  claimMessagesDocument = undefined,
  agreementLogsDocument = undefined,
}) => {
  return h.view("support", {
    errors,
    applicationDocument,
    claimDocument,
    herdDocument,
    paymentDocument,
    agreementMessagesDocument,
    claimMessagesDocument,
    agreementLogsDocument,
  });
};

const getSupportHandler = (request, h) => {
  return createView({ request, h });
};

const searchApplicationHandler = async (request, h) => {
  const { applicationReference } = request.payload;
  const rawDocument = await getApplicationDocument(applicationReference);
  const applicationDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, applicationDocument })).takeover();
};

const searchClaimHandler = async (request, h) => {
  const { claimReference } = request.payload;
  const rawDocument = await getClaimDocument(claimReference);
  const claimDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, claimDocument })).takeover();
};

const searchHerdHandler = async (request, h) => {
  const { herdId } = request.payload;
  const rawDocument = await getHerdDocument(herdId);
  const herdDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, herdDocument })).takeover();
};

const searchPaymentHandler = async (request, h) => {
  const { paymentReference } = request.payload;
  const rawDocument = await getPaymentDocument(paymentReference);
  const paymentDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, paymentDocument })).takeover();
};

const searchAgreementMessagesHandler = async (request, h) => {
  const { agreementMessagesReference } = request.payload;
  const rawDocument = await getAgreementMessagesDocument(agreementMessagesReference);
  const agreementMessagesDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, agreementMessagesDocument })).takeover();
};

const searchClaimMessagesHandler = async (request, h) => {
  const { claimMessagesReference } = request.payload;
  const rawDocument = await getClaimMessagesDocument(claimMessagesReference);
  const claimMessagesDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, claimMessagesDocument })).takeover();
};

const searchAgreementLogsHandler = async (request, h) => {
  const { agreementLogReference } = request.payload;
  const rawDocument = await getAgreementLogsDocument(agreementLogReference);
  const agreementLogsDocument = JSON.stringify(rawDocument, null, 4);
  return (await createView({ request, h, agreementLogsDocument })).takeover();
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
            is: "searchApplication",
            then: Joi.object({
              applicationReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchClaim",
            then: Joi.object({
              claimReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchHerd",
            then: Joi.object({
              herdId: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchPayment",
            then: Joi.object({
              paymentReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchAgreementMessages",
            then: Joi.object({
              agreementMessageReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchClaimMessages",
            then: Joi.object({
              claimMessageReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
          },
          {
            is: "searchAgreementLogs",
            then: Joi.object({
              agreementLogReference: Joi.string().required(),
              action: Joi.string().required(),
            }),
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

            if (receivedError.message.includes('"applicationReference"')) {
              return {
                ...receivedError,
                message: "Application reference missing.",
                href: "#application-reference",
              };
            }

            if (receivedError.message.includes('"claimReference"')) {
              return {
                ...receivedError,
                message: "Claim reference missing.",
                href: "#claim-reference",
              };
            }

            if (receivedError.message.includes('"herdId"')) {
              return {
                ...receivedError,
                message: "Herd id missing.",
                href: "#herd-id",
              };
            }

            if (receivedError.message.includes('"paymentReference"')) {
              return {
                ...receivedError,
                message: "Payment reference missing.",
                href: "#payment-reference",
              };
            }

            if (receivedError.message.includes('"agreementMessageReference"')) {
              return {
                ...receivedError,
                message: "Agreement reference missing.",
                href: "#agreement-message-reference",
              };
            }

            if (receivedError.message.includes('"claimMessageReference"')) {
              return {
                ...receivedError,
                message: "Claim reference missing.",
                href: "#claim-message-reference",
              };
            }

            if (receivedError.message.includes('"agreementLogReference"')) {
              return {
                ...receivedError,
                message: "Agreement reference missing.",
                href: "#agreement-log-reference",
              };
            }

            return null;
          })
          .filter((formattedError) => formattedError !== null)
          .map((formattedError) => ({
            text: formattedError.message,
            key: formattedError.context.key,
            href: formattedError.href,
          }));

        return (await createView({ request, h, errors })).takeover();
      },
    },
    handler: async (request, h) => {
      const { action } = request.payload;
      if (action === "searchApplication") {
        return searchApplicationHandler(request, h);
      }
      if (action === "searchClaim") {
        return searchClaimHandler(request, h);
      }
      if (action === "searchHerd") {
        return searchHerdHandler(request, h);
      }
      if (action === "searchPayment") {
        return searchPaymentHandler(request, h);
      }
      if (action === "searchAgreementMessages") {
        return searchAgreementMessagesHandler(request, h);
      }
      if (action === "searchClaimMessages") {
        return searchClaimMessagesHandler(request, h);
      }
      if (action === "searchAgreementLogs") {
        return searchAgreementLogsHandler(request, h);
      }
    },
  },
};

export const supportRoutes = [getSupportRoute, postSupportRoute];
