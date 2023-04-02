import fs from "node:fs";
import process from "node:process";

import c from "chalk";

import {
  createExportStatement,
  makeComponentNameandPathObject,
  getSuffix,
} from "./helpers.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./paths.mjs";
import { SOURCE_OF_TRUTH } from "./sourceOfTruth.mjs";

const REGEX_INTERFACE = /(?<=interface\s)([aA-zZ]|[\s](?!{))+/;
const EXTENDS = " extends ";
const INTERFACE_END = "}";

const ATTR_SUFFIX = "_attr";
const FUNCTION_SIGNATURE = "=>";
let function_prop_detected = false;

/**
 * @see /utils/sourceOfTruth.mjs
 * @param {string} key
 * @param {string} type
 * @returns {string}
 */
const _makeFakeType = (prop_key, prop_type) => {
  switch (prop_type) {
    case "string": {
      const suffix = getSuffix(prop_key) || ATTR_SUFFIX;
      return `${prop_type}${suffix}`;
    }
    default:
      return prop_type;
  }
};

/**
 * It's here that fake props value are set, derived from their type ("string", "number", a custom Interface, etc).
 * @param {string} prop_key
 * @param {string} prop_type
 * @this {object} SOURCE_OF_TRUTH
 * @returns {array}
 */
const _mapToSourceOfTruthContext = function ([prop_key, prop_type]) {
  const fake_type = _makeFakeType(prop_key, prop_type);
  const is_array_of_types = fake_type.slice(-2) === "[]";

  let fake_value = is_array_of_types
    ? Array.from({ length: 3 }, () => this[fake_type.slice(0, -2)]?.())
    : this[fake_type]?.();

  if (!fake_value) {
    if (prop_type.includes(FUNCTION_SIGNATURE)) {
      function_prop_detected = true;
    }
    fake_value = isNaN(prop_type) ? prop_type : Number(prop_type);
  }

  return [prop_key, fake_value];
};

/**
 * Some "meta-programming" is done when using Object.defineProperty().
 * Getters and functions are added to SOURCE_OF_TRUTH object.
 * When applying JSON.stringify() on SOURCE_OF_TRUTH, getters will be accessed and functions will then be discarded.
 * This is ideal since this will output a json file with values that have been created dynamically at "stringify time".
 * @param {string} file
 */
const _updateSourceOfTruth = async ({ component_name, path }) => {
  const content = await fs.promises.readFile(path, "utf-8"); // Could use createReadStream() and readLine(), but files are expected to be small.
  const content_as_array = content.split("\n");
  const props_list = [];
  let interface_name = undefined;
  let extended_interface = false;

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_match = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(EXTENDS);

    if (interface_match) {
      interface_name = interface_match[0];
      extended_interface = interface_match.length > 1 && interface_match[1];

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] === INTERFACE_END) {
          break parent_loop;
        }

        const [prop_key, prop_type] = content_as_array[j].split(":");

        props_list.push([
          prop_key.replace("?", "").trim(),
          prop_type.replace(";", "").trim(),
        ]);
      }
    }
  }

  if (interface_name && props_list.length) {
    Object.defineProperty(SOURCE_OF_TRUTH, interface_name, {
      enumerable: true,
      value: function () {
        const _props_from_extend = this[extended_interface]?.();
        const _props = Object.fromEntries(
          props_list.map(_mapToSourceOfTruthContext, this)
        );
        return { ..._props_from_extend, ..._props };
      },
    });
  }

  Object.defineProperty(SOURCE_OF_TRUTH, component_name, {
    enumerable: true,
    get() {
      const _self = this; //eslint-disable-line
      return {
        get props() {
          return _self[interface_name]?.();
        },
      };
    },
  });
};

/**
 * @param {string} component_folder
 * @returns {Promise} array
 */
const _getComponentNameAndPath = async (component_folder) => {
  const folder_path = `${COMPONENTS_PATH}/${component_folder}`;
  const files = await fs.promises.readdir(folder_path);
  const effective_files = files.reduce(makeComponentNameandPathObject, [
    folder_path,
  ]);

  return effective_files.slice(1);
};

/**
 * @see package.json
 */
const main = async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);
  const components_name_and_path = await Promise.all(
    component_folders.map(_getComponentNameAndPath)
  ).then((result) => result.flat());

  const components_export_statements = components_name_and_path
    .map(createExportStatement)
    .join("");

  Promise.all(components_name_and_path.map(_updateSourceOfTruth))
    .then(() =>
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
    )
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
      if (function_prop_detected) {
        console.log(
          c.yellow(
            "  (prop.s declaring a Function were discarded,\n  Styleguide-automator cannot generate a fake value for these kind of props)"
          )
        );
      }
    })
    .catch((reason) => {
      console.log(c.red(reason));
      process.exit(1);
    });
};

export { main };
