import { mapAuth } from "../../auth/map-auth.js";

/**
 * Determines the application-level  view states a caseworker sees
 * on an agreement view.
 *
 * @param {object} params
 * @param {object} params.request - the Hapi request; supplies the authenticated account and
 *   the default form flags (`request.query`).
 * @param {object} [params.formFlags=request.query] - booleans for which inline form is open.
 * @returns {{ updateEligiblePiiRedactionAction: boolean, updateEligiblePiiRedactionForm: boolean }}
 */
export const getApplicationStates = ({ request, formFlags = request.query }) => {
  const { updateEligiblePiiRedaction } = formFlags;
  const { isSuperAdmin } = mapAuth(request);

  return {
    updateEligiblePiiRedactionAction: isSuperAdmin,
    updateEligiblePiiRedactionForm: isSuperAdmin && updateEligiblePiiRedaction === true,
  };
};
