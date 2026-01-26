export const getApplicationDocument = async (applicationReference) => {
  // const { payload } = await wreck.get(`https://somehwere/${applicationReference}`, { json: true });

  console.log("Retrieving application document");
  return { document: { some: "value", another: "entry" } };
};
