import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import c from "chalk";

import {
  SOURCE_OF_TRUTH,
  REGEX_IS_TEXT,
  REGEX_IS_PATH,
} from "./sourceOfTruth.mjs";
import { createExportStatement } from "./utils/exportTemplate.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./utils/paths.mjs";

const REGEX_INTERFACE = /(?<=interface\s)([aA-zZ]|[\s](?!{))+/;
const EXTENDS = " extends ";
const TSX = ".tsx";

/**
 * @see /utils/sourceOfTruth.mjs
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
const _getEffectiveSuffix = (key, value) => {
  switch (value) {
    case "string": {
      if (REGEX_IS_PATH.test(key)) {
        return "_path";
      }
      if (REGEX_IS_TEXT.test(key)) {
        return "_text";
      }
      return "_attr";
    }
    default:
      return "";
  }
};

/**
 * @param {array} content_entry
 * @returns {array}
 */
const _mapToSourceOfTruthContext = function (content_entry) {
  let [key, value] = content_entry;
  const is_array_of_values = value.slice(-2) === "[]";
  value += _getEffectiveSuffix(key, value);

  if (is_array_of_values) {
    value = value.slice(0, -2);
    return [key, [this[value](), this[value](), this[value]()]];
  }

  return [key, this[value]()];
};

/**
 * Some "meta-programming" is done when using Object.defineProperty().
 * Getters and functions are added to SOURCE_OF_TRUTH object.
 * When applying JSON.stringify() on SOURCE_OF_TRUTH, getters will be accessed and functions will then be discarded.
 * This is ideal since this gives a json file with values created dynamically.
 * @param {string} file
 * @returns {Promise}
 */
const _updateSourceOfTruth = async (file) => {
  const content = await fs.promises.readFile(file, "utf-8");
  const content_as_array = content.split("\n");

  const component_name = file.split("/").pop().replace(TSX, "");
  const path = file.replace(TSX, "");
  const props_list = [];
  let interface_name = undefined;
  let extended_interface = false;

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_match /*: string[] | undefined*/ = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(EXTENDS);

    if (interface_match) {
      interface_name = interface_match[0];
      extended_interface = interface_match.length > 1 && interface_match[1];

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] !== "}") {
          let [key, value] = content_as_array[j].split(":");

          props_list.push([
            key.replace("?", "").trim(),
            value.replace(";", "").trim(),
          ]);
        } else {
          break parent_loop;
        }
      }
    }
  }

  if (interface_name && props_list.length) {
    Object.defineProperty(SOURCE_OF_TRUTH, interface_name, {
      enumerable: true,
      value: function () {
        return Object.fromEntries(
          props_list.map(_mapToSourceOfTruthContext, this)
        );
      },
    });
  }

  Object.defineProperty(SOURCE_OF_TRUTH, component_name, {
    enumerable: true,
    get() {
      const _self = this; //eslint-disable-line
      return {
        get props() {
          const extended_props = _self[extended_interface]?.() ?? {};
          const props = _self[interface_name]?.();
          return { ...extended_props, ...props };
        },
      };
    },
  });

  return { component_name, path };
};

/**
 * @param {string} component_folder
 * @returns {Promise}
 */
const _setComponentSpecs = async (component_folder) => {
  const files = await fs.promises.readdir(
    `${COMPONENTS_PATH}/${component_folder}`
  );

  const component_files = files
    .filter((file) => path.extname(file) === TSX)
    .map((tsx_file) => `${COMPONENTS_PATH}/${component_folder}/${tsx_file}`);

  return Promise.all(component_files.map(_updateSourceOfTruth));
};

/**
 * @see package.json
 */
const main = async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);
  const components_name_and_path = await Promise.all(
    component_folders.map(_setComponentSpecs)
  ).then((result) => result.flat());

  const components_export_statements = components_name_and_path
    .map(createExportStatement)
    .join("");

  Promise.all([
    fs.promises.writeFile(
      `${STYLEGUIDE_PATH}/index.ts`,
      components_export_statements
    ),
    fs.promises.writeFile(
      `${STYLEGUIDE_PATH}/componentsToRender.json`,
      JSON.stringify(SOURCE_OF_TRUTH, null, 2) // Maybe use a reviver to generate fake_props_variants?
    ),
  ])
    .then(() => {
      console.log(
        c.blueBright.bold(
          `  components exports and render specs created in ${(
            performance.now() - t1
          )
            .toString()
            .slice(0, 4)}ms:`
        )
      );
      console.log(
        c.blueBright(
          components_name_and_path
            .map(({ component_name }) => `    <${component_name}/>`)
            .join("\n")
        )
      );
    })
    .catch((reason) => {
      console.log(c.red(reason));
      process.exit(1);
    });
};

export { main };
