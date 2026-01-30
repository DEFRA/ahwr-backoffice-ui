import joi from "joi";
import { permissions } from "../auth/permissions.js";
import { updateClaimFailAction, updateClaimHandler } from "./claim/build-update-claim-route.js";

export const updateStatusRoute = {
  method: "post",
  path: "/update-status",
  options: {
    auth: { scope: [permissions.administrator] },
    validate: {
      payload: joi.object({
        reference: joi.string().required(),
        status: joi.string().required(),
        note: joi.string().required().messages({
          "any.required": "Enter note",
          "string.empty": "Enter note",
        }),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
      }),
      failAction: async (request, h, error) => {
        return updateClaimFailAction(request, h, error, "#update-status", "updateStatus");
      },
    },
    handler: async (request, h) => {
      const { status } = request.payload;
      return updateClaimHandler(request, h, status);
    },
  },
};
