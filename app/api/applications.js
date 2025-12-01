import wreck from "@hapi/wreck";
import { config } from "../config/index.js";

const { applicationApiUri } = config;

export async function getApplication(applicationReference, logger) {
  const endpoint = `${applicationApiUri}/applications/${applicationReference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function getApplications(
  searchType,
  searchText,
  limit,
  offset,
  filterStatus,
  sort,
  logger,
) {
  const endpoint = `${applicationApiUri}/applications/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset,
      filter: filterStatus,
      sort,
    },
    json: true,
  };
  try {
    const { payload } = await wreck.post(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function processApplicationClaim(reference, user, approved, logger, note) {
  const endpoint = `${applicationApiUri}/applications/claim`;
  const options = {
    payload: {
      reference,
      user,
      approved,
      note,
    },
    json: true,
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
  };
  try {
    const { payload } = await wreck.put(endpoint, options);
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function getApplicationEvents(reference, logger) {
  const endpoint = `${applicationApiUri}/applications/events/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (error) {
    logger.error({ error });
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
    const { payload } = await wreck.post(endpoint, {});
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
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}