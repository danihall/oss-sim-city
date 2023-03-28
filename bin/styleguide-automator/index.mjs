import fs from "node:fs";
import process from "node:process";

import c from "chalk";

import { createExportStatement } from "./utils/exportTemplate.mjs";
import { getComponentSpecs } from "./utils/getComponentSpecs.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./utils/paths.mjs";
import { SOURCE_OF_TRUTH } from "./utils/sourceOfTruth.mjs";

/**
 * @param {Array} entry
 * @returns {Array}
 */
const transformComponentSpecs = (entry) => {
  const [, { component_name, props }] = entry;
  const props_as_array = Object.entries(props);
  const fake_props_variant = props_as_array.reduce(reduceToFakePropsList, [
    makeFakePropsObject(props_as_array),
  ]);

  return [component_name, { fake_props_variant }];
};

/**
 * @param {Array} acc
 * @param {Array} cur
 * @param {Array} array
 * @returns {Array}
 */
const reduceToFakePropsList = (acc, cur, _index, array) => {
  const [key, value] = cur;
  if (value === "boolean") {
    return [...acc, { ...makeFakePropsObject(array), [key]: !value }];
  }
  return acc;
};

/**
 * @param {Array} array
 * @returns {Object}
 */
const makeFakePropsObject = (array) => {
  return Object.fromEntries(array.map(mapPropTypeToFakeValue));
};

/**
 * @param {Array}
 * @returns {Array}
 */
const mapPropTypeToFakeValue = ([prop_name, type]) => {
  return [prop_name, SOURCE_OF_TRUTH[type]];
};

(async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);
  const components_specs = await Promise.all(
    component_folders.map(getComponentSpecs)
  );

  console.log(components_specs);

  const components_export_statements = components_specs
    .map(createExportStatement)
    .join("");

  /*
  const components_render_specs = Object.fromEntries(
    Object.entries({ ...components_specs }).map(transformComponentSpecs)
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
    .then(() => {
      console.log(
        c.greenBright(
          c.green.bold(
            components_specs
              .map(({ component_name }) => `<${component_name}/>`)
              .join("\n")
          )
        )
      );

      console.log(
        c.green.underline(
          `components exports and render specs created in ${(
            performance.now() - t1
          )
            .toString()
            .slice(0, 4)}ms`
        )
      );
    })
    .catch(() => process.exit(1));
    */
})();
