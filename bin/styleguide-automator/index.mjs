import fs from "node:fs";
import process from "node:process";

import chalk from "chalk";

import { createExportStatement } from "./utils/exportTemplate.mjs";
import { getFileContent } from "./utils/helpers.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./utils/paths.mjs";
import { PROP_TYPES_MAP } from "./utils/propTypesMap.mjs";

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

  console.log(
    chalk.greenBright(
      "fake values props for " +
        chalk.green.bold(`<${component_name}/>`) +
        chalk.greenBright(" created!")
    )
  );

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
const makeFakePropsObject = (array) =>
  Object.fromEntries(array.map(mapPropTypeToFakeValue));

/**
 * @param {Array}
 * @returns {Array}
 */
const mapPropTypeToFakeValue = ([prop_name, type]) => [
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
        chalk.green(
          `components exports and render specs created in ${(
            performance.now() - t1
          )
            .toString()
            .slice(0, 4)}ms`
        )
      )
    )
    .catch((reason) => (console.error(reason), process.exit(1)));
})();
