import fs from "node:fs";
import process from "node:process";

import { createExportStatement } from "./exportTemplate.mjs";
import { getFileContent } from "./helpers.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./paths.mjs";
import { PROP_TYPES_MAP } from "./propTypesMap.mjs";

/**
 * @TODO
 * Handle case when a prop is a callback, eg: type is () => void. Remove it from props, probably in helpers.mjs.
 * Add console.logs of each component name being processed + style console.logs and console.errors.
 */

/**
 * @param {Array} entry
 * @returns {Array}
 */
const transformComponentSpecs = (entry) => {
  const [, { component_name, props }] = entry;
  const props_as_array = Object.entries(props);
  const fake_props = [Object.fromEntries(props_as_array.map(makeFakeProps))];

  return [component_name, { props_variants: fake_props }];
};

/**
 * @param {Array}
 * @returns {Array}
 */
const makeFakeProps = ([prop_name, type]) => [
  prop_name.replace("?", ""),
  PROP_TYPES_MAP[type],
];

/**
 * @note this IIFE will execute whan you input "yarn styleguide". @see package.json->scripts
 */
(async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);
  const component_specs = await Promise.all(
    component_folders.map(getFileContent)
  );

  const components_export_statements = component_specs
    .map((component) => createExportStatement(component))
    .join("");

  const components_render_specs = Object.fromEntries(
    Object.entries({ ...component_specs }).map(transformComponentSpecs)
  );

  Promise.all([
    fs.promises.writeFile(
      `${STYLEGUIDE_PATH}/index.ts`,
      components_export_statements
    ),
    fs.promises.writeFile(
      `${STYLEGUIDE_PATH}/componentsToRender.json`,
      JSON.stringify(components_render_specs, null, 2)
    ),
  ])
    .then(() =>
      console.log(
        `components exports and render specs created in ${(
          performance.now() - t1
        )
          .toString()
          .slice(0, 4)}ms`
      )
    )
    .catch((reason) => (console.error(reason), process.exit(1)));
})();
