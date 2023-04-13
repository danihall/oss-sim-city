import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { printInvalidConfig } from "./printProcess.mjs";

const default_config = {
  folders_to_parse: [".+"],
  components_path: "src/components",
  styleguide_path: "src/pages/StyleguidePage",
};

const { components_path, styleguide_path, folders_to_parse } = await import(
  "../../package.json"
).then((json) => ({
  ...default_config,
  ...json.default["styleguide-automator"],
}));

/**
 * @param {string} relative_path
 * @returns {Promise}
 */
const _getAbsolutePath = (relative_path) =>
  fs.promises.access(relative_path).then(() => path.resolve(relative_path));

const effective_paths = await Promise.all(
  [components_path, styleguide_path].map(_getAbsolutePath)
).catch((reason) => void (printInvalidConfig(reason), process.exit(1)));

// constants to export
const [COMPONENTS_PATH, STYLEGUIDE_PATH] = effective_paths;
const PATH_FROM_STYLEGUIDE_TO_COMPONENTS = path.relative(
  STYLEGUIDE_PATH,
  COMPONENTS_PATH
);
const FOLDERS_TO_PARSE_REGEX = new RegExp(`^${folders_to_parse.join("|")}$`);
const TSX = ".tsx";

export {
  COMPONENTS_PATH,
  STYLEGUIDE_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
  FOLDERS_TO_PARSE_REGEX,
  TSX,
};
