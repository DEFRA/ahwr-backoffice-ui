import Joi from "joi";
import { permissions } from "../../auth/permissions.js";
import { getApplicationDocument } from "./support-calls.js";

const { administrator } = permissions;

const createView = async ({ request, h, errors = undefined, applicationDocument = undefined }) => {
  return h.view("support", { errors, applicationDocument });
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

const getSupportRoute = {
  method: "GET",
  path: "/support",
  options: {
    auth: {
      scope: [administrator],
    },
    handler: getSupportHandler,
  },
};

const postSupportRoute = {
  method: "POST",
  path: "/support",
  options: {
    auth: {
      scope: [administrator],
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
      // const { action } = request.payload;
      // if (action === "") {
      return searchApplicationHandler(request, h);
      // }
      // return boom.notFound(`${action} is not supported`);
    },
  },
};

export const supportRoutes = [getSupportRoute, postSupportRoute];
