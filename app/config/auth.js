import joi from "joi";

const buildAuthConfig = () => {
  const schema = joi.object({
    enabled: joi.boolean().required(),
    clientSecret: joi.string().required(),
    clientId: joi.string().required(),
    authority: joi.string().uri().required(),
    redirectUrl: joi.string().uri().required()
  });

  const config = {
    enabled: process.env.AADAR_ENABLED === "true",
    clientSecret: process.env.AADAR_CLIENT_SECRET,
    clientId: process.env.AADAR_CLIENT_ID,
    authority: process.env.AADAR_AUTHORITY_URL,
    redirectUrl: process.env.AADAR_REDIRECT_URL,
  };

  if (process.env.NODE_ENV === "test") {
    return config;
  }

  const { error } = schema.validate(config, { abortEarly: false });

  if (error) {
    throw new Error(`The auth config is invalid. ${error.message}`);
  }

  return config;
};

export const authConfig = buildAuthConfig();
