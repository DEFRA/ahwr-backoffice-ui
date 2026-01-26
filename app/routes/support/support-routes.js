// import boom from "@hapi/boom";
import Joi from "joi";
import { permissions } from "../../auth/permissions.js";
import { createView, getSupportHandler, searchApplicationHandler } from "./support-handlers.js";

const { administrator } = permissions;

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
        return createView(request, h, error);
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
