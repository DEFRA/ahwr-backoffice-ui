import wreck from "@hapi/wreck";
import { config } from "../config/index.js";

const { applicationApiUri } = config;

export async function getClaim(reference, logger) {
  const endpoint = `${applicationApiUri}/claims/get-by-reference/${reference}`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function getClaims(searchType, searchText, filter, limit, offset, sort, logger) {
  const endpoint = `${applicationApiUri}/claims/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      filter,
      limit,
      offset,
      sort,
    },
    json: true,
  };
  try {
    const { payload } = await wreck.post(endpoint, options);

    return payload;
  } catch (err) {
    logger.error({ err }, "Error fetching claims");
    throw err;
  }
}

export async function updateClaimStatus(reference, user, status, logger, note) {
  const endpoint = `${applicationApiUri}/claims/update-by-reference`;
  const options = {
    payload: {
      reference,
      status,
      user,
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

export async function updateClaimData(reference, data, note, name, logger) {
  const endpoint = `${applicationApiUri}/claims/${reference}/data`;

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

export async function getClaimHistory(claimRef, logger) {
  const endpoint = `${applicationApiUri}/claims/${claimRef}/history`;
  try {
    const { payload } = await wreck.get(endpoint, { json: true });
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}