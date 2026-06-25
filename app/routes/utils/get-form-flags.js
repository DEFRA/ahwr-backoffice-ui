import { DEFAULT_FORM_FLAGS } from "./get-claim-view-states.js";

export const getFormFlags = (formFlagKey) => ({ ...DEFAULT_FORM_FLAGS, [formFlagKey]: true });
