// import wreck from "@hapi/wreck";

export const createView = async (request, h, errors) => {
  return h.view("support", {}, errors);
};

export const getSupportHandler = (request, h) => {
  return createView(request, h);
};

export const searchApplicationHandler = async (request, h) => {
  // const { applicationReference } = request.payload;
  // const { payload } = await wreck.get(`https://somehwere/${applicationReference}`, { json: true });
  return createView(request, h);
};
