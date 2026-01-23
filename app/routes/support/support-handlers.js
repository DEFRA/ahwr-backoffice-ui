const createView = async (request, h) => {
  return h.view("support", {});
};

export const getSupportHandler = (request, h) => {
  return createView(request, h);
};

export const searchApplicationHandler = (request, h) => {};
