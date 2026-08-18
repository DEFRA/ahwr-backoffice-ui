export const generateNewCrumb = async (request, h) => {
  request.plugins.crumb = null;
  await request.server.plugins.crumb.generate(request, h);
};
