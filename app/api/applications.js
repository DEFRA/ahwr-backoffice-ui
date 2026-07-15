import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { AGREEMENT_TYPE } from "../constants/index.js";

const { applicationApiUri, apiKeys } = config;

export async function getApplication(applicationReference, logger) {
  const endpoint = `${applicationApiUri}/applications/${applicationReference}`;
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

export async function getApplications(searchParameters, limit, offset, sort, logger) {
  const { searchText, searchType, filterStatus, agreementType, dateFrom, dateTo } =
    searchParameters;
  const endpoint = `${applicationApiUri}/applications/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset,
      filter: filterStatus,
      ...(agreementType && agreementType !== AGREEMENT_TYPE.ALL && { agreementType }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      sort,
    },
    json: true,
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };
  try {
    const { payload } = await wreck.post(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function updateApplicationStatus(reference, user, status, logger, note) {
  const endpoint = `${applicationApiUri}/applications/${reference}`;
  const options = {
    payload: {
      user,
      status,
      note,
    },
    json: true,
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };
  try {
    const { payload } = await wreck.put(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function updateApplicationData(reference, data, note, name, logger) {
  const endpoint = `${applicationApiUri}/applications/${reference}/data`;
  const options = {
    payload: {
      ...data,
      note,
      user: name,
    },
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };

  try {
    const { payload } = await wreck.put(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function redactPiiData(logger) {
  const endpoint = `${applicationApiUri}/redact/pii`;
  try {
    const { payload } = await wreck.post(endpoint, {
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function updateEligiblePiiRedaction(reference, data, note, name, logger) {
  const endpoint = `${applicationApiUri}/applications/${reference}/eligible-pii-redaction`;
  const options = {
    payload: {
      ...data,
      note,
      user: name,
    },
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };

  try {
    const { payload } = await wreck.put(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function getOldWorldApplicationHistory(oldWorldAppRef, logger) {
  const endpoint = `${applicationApiUri}/applications/${oldWorldAppRef}/history`;
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
