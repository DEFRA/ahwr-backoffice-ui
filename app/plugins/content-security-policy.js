import Blankie from "blankie";

export const contentSecurityPolicyPlugin = {
  plugin: Blankie,
  options: {
    defaultSrc: ["self"],
    objectSrc: ["none"],
    scriptSrc: ["self"],
    formAction: ["self"],
    baseUri: ["self"],
    connectSrc: ["self"],
    styleSrc: ["self"],
    imgSrc: ["self"],
    frameAncestors: ["none"],
    generateNonces: "script",
  },
};
