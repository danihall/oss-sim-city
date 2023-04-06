import path from "node:path";

const COMPONENTS_PATH = path.resolve("src/components");
const STYLEGUIDE_PATH = path.resolve("src/pages/StyleguidePage");
const PATH_FROM_STYLEGUIDE_TO_COMPONENTS = path.relative(
  STYLEGUIDE_PATH,
  COMPONENTS_PATH
);

export { COMPONENTS_PATH, STYLEGUIDE_PATH, PATH_FROM_STYLEGUIDE_TO_COMPONENTS };
