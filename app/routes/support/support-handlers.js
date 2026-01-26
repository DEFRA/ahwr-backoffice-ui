// import wreck from "@hapi/wreck";

const createView = async (request, h) => {
  return h.view("support", {});
};

export const getSupportHandler = (request, h) => {
  return createView(request, h);
};

export const searchApplicationHandler = async (request, h) => {
  // const { applicationReference } = request.payload;
  // const { payload } = await wreck.get(`https://somehwere/${applicationReference}`, { json: true });
  return createView(request, h);
};
