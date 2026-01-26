import Joi from "joi";
import { permissions } from "../../auth/permissions.js";

const { administrator } = permissions;

const createView = async ({ request, h, errors = undefined }) => {
  return h.view("support", { errors });
};

const getSupportHandler = (request, h) => {
  return createView({ request, h });
};

const searchApplicationHandler = async (request, h) => {
  // const { applicationReference } = request.payload;
  // const { payload } = await wreck.get(`https://somehwere/${applicationReference}`, { json: true });
  return createView({ request, h });
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

            if (receivedError.message.includes("something")) {
              return {
                ...receivedError,
              };
            }

            return null;
          })
          .filter((formattedError) => formattedError !== null)
          .map((formattedError) => ({
            text: formattedError.message,
            key: formattedError.context.key,
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
