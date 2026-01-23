import Joi from "joi";
import { permissions } from "../../auth/permissions.js";
import { getSupportHandler, searchApplicationHandler } from "./support-handlers.js";

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
    handler: async (request, h) => {
      const { action } = request.payload;
      if (action === "") {
        return searchApplicationHandler(request, h);
      }
    },
  },
};

export const supportRoutes = [getSupportRoute, postSupportRoute];
