import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { metricsCounter } from "../lib/metrics.js";

const { applicationApiUri, apiKeys } = config;

export async function getAllFlags(logger) {
  const endpoint = `${applicationApiUri}/flags`;
  try {
    const { payload } = await wreck.get(endpoint, {
      json: true,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function deleteFlag({ flagId, deletedNote }, user, logger) {
  const endpoint = `${applicationApiUri}/flags/${flagId}/delete`;
  try {
    await wreck.patch(endpoint, {
      json: true,
      payload: { user, deletedNote },
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });
    await metricsCounter("flag_deleted");
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function createFlag(payload, appRef, logger) {
  const endpoint = `${applicationApiUri}/applications/${appRef}/flag`;
  try {
    const res = await wreck.post(endpoint, {
      json: true,
      payload,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });
    await metricsCounter("flag_created");
    return res;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}
