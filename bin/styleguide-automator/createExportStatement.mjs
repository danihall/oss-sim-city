import { TSX } from "./constants.mjs";
import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./getConfig.mjs";

/**
 * @param {TemplateStringsArray} static_chunks
 * @param  {Array} rest
 * @returns {string}
 */
const _template = (static_chunks, ...rest) => {
  const string_as_array = [];

  for (let i = 0; i < static_chunks.length; i++) {
    string_as_array.push(static_chunks[i] + (rest[i] ?? ""));
  }

  return string_as_array.join("");
};

/**
 * @param {string} params.component_name
 * @param {string} params.path
 * @returns {string}
 */
const createExportStatement = ({ component_name, path }) => {
  const sanitized_path = path.replace(TSX, "");
  return _template`export {${component_name}} from "${sanitized_path.replace(
    COMPONENTS_PATH,
    PATH_FROM_STYLEGUIDE_TO_COMPONENTS
  )}";`;
};

export { createExportStatement };
