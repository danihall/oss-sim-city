import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { printInvalidConfig } from "./printProcess.mjs";

const default_config = {
  ignore_all_but: null,
  components_path: "src/components",
  styleguide_path: "src/pages/StyleguidePage",
};

const { components_path, styleguide_path, ignore_all_but } = await import(
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

const [COMPONENTS_PATH, STYLEGUIDE_PATH] = effective_paths;
const PATH_FROM_STYLEGUIDE_TO_COMPONENTS = path.relative(
  STYLEGUIDE_PATH,
  COMPONENTS_PATH
);
const IGNORE_ALL_BUT_REGEX =
  ignore_all_but.length &&
  new RegExp(`^(?:(?!${ignore_all_but.join("|")}).)*$`);

export {
  COMPONENTS_PATH,
  STYLEGUIDE_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
  IGNORE_ALL_BUT_REGEX,
};
