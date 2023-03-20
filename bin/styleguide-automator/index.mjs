import fs from "node:fs";
import process from "node:process";

import { createExportStatement } from "./exportTemplate.mjs";
import { getFileContent } from "./helpers.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./paths.mjs";
import { PROP_TYPES_MAP } from "./propTypesMap.mjs";

/**
 * @TODO
 * Fully handle case for optional props where ( number of possible configs === Math.pow(2, optional_props_count) )
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

  const optional_props = Object.keys(fake_props[0]).filter(getOptionalKey);
  if (optional_props.length) {
    optional_props.forEach(addPropsVariantConfig, {
      fake_props,
      props_as_array,
    });
  }

  return [component_name, { props_variants: fake_props }];
};

/**
 * @param {Array}
 * @returns {Array}
 */
const makeFakeProps = ([prop_name, type]) => [prop_name, PROP_TYPES_MAP[type]];

/**
 * @param {string} prop_key
 * @returns {boolean}
 */
const getOptionalKey = (prop_key) => prop_key.includes("?");

/**
 * @this {object}
 * @param {string} optional_prop
 */
const addPropsVariantConfig = function (optional_prop) {
  this.fake_props.push(
    Object.fromEntries(
      this.props_as_array
        .filter(isNotOptionalProp, { optional_prop })
        .map(makeFakeProps)
    )
  );
};

/**
 * @this {object}
 * @param {Array}
 * @returns {boolean}
 */
const isNotOptionalProp = function ([prop_name]) {
  return prop_name !== this.optional_prop;
};

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
