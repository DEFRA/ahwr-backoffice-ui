import Joi from "joi";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { createFlagsTableData } from "./models/flags-list.js";
import { deleteFlag as deleteFlagApiCall, createFlag as createFlagApiCall } from "../api/flags.js";
import { StatusCodes } from "http-status-codes";
import { mapAuth } from "../auth/map-auth.js";

const { administrator, processor, user, recommender, authoriser } = permissions;
const MIN_APPLICATION_REFERENCE_LENGTH = 14;
const MIN_NOTE_LENGTH = 1;
const STRING_EMPTY = "string.empty";

const AGREEMENT_REFERENCE = "#agreement-reference";

const ERRORS = {
  AGREEMENT_REDACTED: [
    {
      message: "Flag not created - agreement is redacted.",
      path: [],
      type: STRING_EMPTY,
      context: {
        key: "appRef",
      },
    },
  ],
};

const createView = async (request, h, deleteFlag, createFlag, errors) => {
  await generateNewCrumb(request, h);
  const { isAdministrator } = mapAuth(request);

  return h.view("flags", {
    ...(await createFlagsTableData({
      logger: request.logger,
      flagIdToDelete: deleteFlag,
      createFlag,
      isAdmin: isAdministrator,
    })),
    errors,
    isAdmin: isAdministrator,
  });
};

const getFlagsHandler = {
  method: "GET",
  path: "/flags",
  options: {
    auth: {
      scope: [administrator, processor, user, recommender, authoriser],
    },
    validate: {
      query: Joi.object({
        createFlag: Joi.bool(),
        deleteFlag: Joi.string(),
        errors: Joi.string(),
      }),
    },
    handler: async (request, h) => {
      const { createFlag, deleteFlag, errors } = request.query;

      const parsedErrors = errors ? JSON.parse(Buffer.from(errors, "base64").toString("utf8")) : [];

      return createView(request, h, deleteFlag, createFlag, parsedErrors);
    },
  },
};

const deleteFlagHandler = {
  method: "POST",
  path: "/flags/delete",
  options: {
    auth: {
      scope: [administrator],
    },
    validate: {
      payload: Joi.object({
        flagId: Joi.string().required(),
        deletedNote: Joi.string().min(2).required(),
      }),
      failAction: async (request, h, error) => {
        request.logger.error({ error });

        const joiError = error.details[0];

        let errorMessageToBeRendered = "";

        if (joiError.message.includes("length must be at least 2 characters long")) {
          errorMessageToBeRendered = "Enter a note of at least 2 characters in length";
        } else {
          errorMessageToBeRendered = "Enter a note to explain the reason for removing this flag";
        }

        const formattedErrors = [
          {
            ...joiError,
            message: errorMessageToBeRendered,
          },
        ].map((formattedError) => ({
          text: formattedError.message,
          href: "#deletedNote",
          key: formattedError.context.key,
        }));

        return (
          await createView(request, h, request.payload.flagId, false, formattedErrors)
        ).takeover();
      },
    },
    handler: async (request, h) => {
      try {
        const { flagId, deletedNote } = request.payload;
        const { name: userName } = request.auth.credentials.account;
        await deleteFlagApiCall({ flagId, deletedNote }, userName, request.logger);

        return h.redirect(`/flags`).takeover();
      } catch (err) {
        return h
          .view("flags", { ...request.payload, error: err })
          .code(StatusCodes.BAD_REQUEST)
          .takeover();
      }
    },
  },
};

const createFlagHandler = {
  method: "POST",
  path: "/flags",
  options: {
    auth: {
      scope: [administrator],
    },
    validate: {
      payload: Joi.object({
        appRef: Joi.string().min(MIN_APPLICATION_REFERENCE_LENGTH).required(),
        note: Joi.string().min(MIN_NOTE_LENGTH).required(),
        appliesToMh: Joi.string().valid("yes", "no").required(),
      }),
      failAction: async (request, h, error) => {
        request.logger.error({ error });

        const errors = error.details
          .map((receivedError) => {
            if (receivedError.message.includes("note")) {
              return {
                ...receivedError,
                message: "Enter a note to explain the reason for creating the flag.",
                href: "#note",
              };
            }

            if (receivedError.message.includes("appRef")) {
              return {
                ...receivedError,
                message: "Enter a valid agreement reference.",
                href: AGREEMENT_REFERENCE,
              };
            }

            if (receivedError.message.includes("appliesToMh")) {
              return {
                ...receivedError,
                message: "Select if the flag is because the user declined multiple herds T&C's.",
                href: "#appliesToMh",
              };
            }

            return null;
          })
          .filter((formattedError) => formattedError !== null)
          .map((formattedError) => ({
            text: formattedError.message,
            href: formattedError.href,
            key: formattedError.context.key,
          }));

        return (await createView(request, h, false, true, errors)).takeover();
      },
    },
    handler: async (request, h) => {
      try {
        const { name: userName } = request.auth.credentials.account;
        const { note, appliesToMh, appRef } = request.payload;
        const payload = {
          user: userName,
          note: note.trim(),
          appliesToMh: appliesToMh === "yes",
        };

        const { res } = await createFlagApiCall(payload, appRef.trim(), request.logger);

        if (res.statusCode === StatusCodes.NO_CONTENT) {
          const error = {
            data: {
              res: {
                statusCode: StatusCodes.NO_CONTENT,
              },
            },
          };
          throw error;
        }

        return createView(request, h);
      } catch (error) {
        request.logger.error({ error });
        let formattedErrors = [];

        if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
          formattedErrors = [
            {
              message: "Agreement reference does not exist.",
              path: [],
              type: STRING_EMPTY,
              context: {
                key: "appRef",
              },
              href: AGREEMENT_REFERENCE,
            },
          ];
        }

        if (error.data.res.statusCode === StatusCodes.NO_CONTENT) {
          formattedErrors = [
            {
              message: `Flag not created - agreement flag with the same "Flag applies to multiple herds T&C's" value already exists.`,
              path: [],
              type: STRING_EMPTY,
              context: {
                key: "appRef",
              },
              href: AGREEMENT_REFERENCE,
            },
          ];
        }

        if (
          error.isBoom &&
          error.data.payload.message === "Unable to create flag for redacted agreement"
        ) {
          formattedErrors = ERRORS.AGREEMENT_REDACTED.map((redactedError) => ({
            ...redactedError,
            href: AGREEMENT_REFERENCE,
          }));
        }

        if (formattedErrors.length) {
          const errors = formattedErrors.map((formattedError) => ({
            text: formattedError.message,
            href: formattedError.href,
            key: formattedError.context.key,
          }));
          return createView(request, h, false, true, errors);
        }

        return h
          .view("flags", await createFlagsTableData({ logger: request.logger }))
          .code(StatusCodes.BAD_REQUEST)
          .takeover();
      }
    },
  },
};

export const flagsRoutes = [getFlagsHandler, deleteFlagHandler, createFlagHandler];
