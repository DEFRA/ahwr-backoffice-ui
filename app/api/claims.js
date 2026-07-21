import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { metricsCounter } from "../lib/metrics.js";
import { AGREEMENT_TYPE } from "../constants/index.js";
import { SEARCH_STATUS } from "../routes/utils/get-claim-status-options.js";

const { applicationApiUri, apiKeys } = config;

export async function getClaim(reference, logger) {
  const endpoint = `${applicationApiUri}/claims/${reference}`;
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

export async function getClaims(searchParameters, limit, offset, sort, logger) {
  const { searchText, searchType, status, agreementType } = searchParameters;
  const hasAgreementType = agreementType && agreementType !== AGREEMENT_TYPE.ALL;
  const hasStatus = status && status !== SEARCH_STATUS.ALL;

  const endpoint = `${applicationApiUri}/claims/search`;
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset,
      ...(hasAgreementType && { agreementType }),
      sort,
      ...(hasStatus && { status }),
    },
    json: true,
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
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
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };
  try {
    const { payload } = await wreck.put(endpoint, options);
    await metricsCounter("claim_status_update");
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
    headers: { "x-api-key": apiKeys.backofficeUiApiKey },
  };

  try {
    const { payload } = await wreck.put(endpoint, options);
    await metricsCounter("claim_data_update");
    return payload;
  } catch (error) {
    logger.error({ error, endpoint });
    throw error;
  }
}

export async function getClaimHistory(claimRef, logger) {
  const endpoint = `${applicationApiUri}/claims/${claimRef}/history`;
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
