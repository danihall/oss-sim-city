import fs from "node:fs";
import process from "node:process";

import {
  createExportStatement,
  getComponentNameAndPath,
  getKeyAndFakeType,
  createPossiblePropsVariants,
  printProcessSuccess,
  printProcessError,
} from "./helpers.mjs";
import { COMPONENTS_PATH, STYLEGUIDE_PATH } from "./paths.mjs";
import { SOURCE_OF_TRUTH } from "./sourceOfTruth.mjs";

const REGEX_INTERFACE = /(?<=interface\s)([aA-zZ]|[\s](?!{))+/;
const REGEX_PROP_VARIANT = /[A-Za-z]*(\s\|\s[A-Za-z]*)*"/;

const HINT_EXTENDS = " extends ";
const HINT_INTERFACE_END = "}";
const HINT_ARRAY = "[]";
const HINT_FUNCTION = "=>";

let function_prop_detected = [];

/**
 * It's here that fake props value are set, derived from their documented type ("string", "number", a custom Interface, etc).
 * @param {string} prop_key
 * @param {string} prop_type
 * @this {object} SOURCE_OF_TRUTH
 * @returns {array}
 */
const _getFakeValueFromUserType = function (prop_type) {
  const is_array_of_types = prop_type.slice(-2) === HINT_ARRAY;
  if (is_array_of_types) {
    console.log(prop_type);
    console.log(this[prop_type.slice(0, -2)]());
  }

  let fake_value = is_array_of_types
    ? Array.from({ length: 5 }, () => this[prop_type.slice(0, -2)]?.())
    : this[prop_type]?.();

  if (!fake_value) {
    fake_value = isNaN(prop_type) ? prop_type : Number(prop_type);
  }

  return fake_value;
};

/**
 * Some "meta-programming" is done when using Object.defineProperty().
 * Getters and functions are added to SOURCE_OF_TRUTH object.
 * When applying JSON.stringify() on SOURCE_OF_TRUTH, getters will be accessed and functions|undefined will then be discarded. (undefined will be discarde when in an object)
 * We can take advantage of this and output a json file with values that have been created dynamically at "stringify time".
 * @param {string} component_name
 * @param {string} path
 */
const _updateSourceOfTruth = async ({ component_name, path }) => {
  /** Could use createReadStream() and readLine(), but files are expected to be small. */
  const content_as_array = await fs.promises
    .readFile(path, "utf-8")
    .then((content) => content.split("\n"));

  let interface_name = undefined;
  let extended_interface = undefined;
  const props = {};

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_match = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(HINT_EXTENDS);

    if (interface_match) {
      interface_name = interface_match[0];
      extended_interface = interface_match.length > 1 && interface_match[1];

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] === HINT_INTERFACE_END) {
          /** Adds a function in SOURCE_OF_TRUTH that will be called automatically at JSON.stringify time */
          SOURCE_OF_TRUTH[interface_name] = function () {
            return { ...this[extended_interface]?.(), ...props };
          };

          break parent_loop;
        }

        const [prop_key, prop_type] = getKeyAndFakeType(content_as_array[j]);

        if (prop_type.includes(HINT_FUNCTION)) {
          function_prop_detected.push(`${prop_key}: ${prop_type}`);
          continue;
        }

        if (prop_type in SOURCE_OF_TRUTH) {
          props[prop_key] = SOURCE_OF_TRUTH[prop_type]();
        } else {
          /** Getters need to be set with "enumerable: true" or they won't be accessed at JSON.stringify time */
          Object.defineProperty(props, prop_key, {
            enumerable: true,
            get: () =>
              _getFakeValueFromUserType.call(SOURCE_OF_TRUTH, prop_type),
          });
        }
      }
    }
  }

  Object.defineProperty(SOURCE_OF_TRUTH, component_name, {
    enumerable: true,
    get() {
      const context = this; //eslint-disable-line
      return {
        get fake_props() {
          if (!(interface_name in context)) {
            return undefined;
          }

          const props_variations = context[interface_name]();
          return props_variations;
        },
      };
    },
  });
};

/**
 * @see package.json
 */
const main = async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);
  const components_name_and_path = await Promise.all(
    component_folders.map(getComponentNameAndPath)
  ).then((result) => result.flat());

  const components_export_statements = components_name_and_path
    .map(createExportStatement)
    .join("");

  Promise.all(components_name_and_path.map(_updateSourceOfTruth))
    .then(() => {
      return Promise.all([
        fs.promises.writeFile(
          `${STYLEGUIDE_PATH}/index.ts`,
          components_export_statements
        ),
        fs.promises.writeFile(
          `${STYLEGUIDE_PATH}/componentsToRender.json`,
          JSON.stringify(SOURCE_OF_TRUTH, null, 2)
        ),
      ]);
    })
    .then(() => {
      printProcessSuccess(
        performance.now() - t1,
        components_name_and_path,
        function_prop_detected
      );
    })
    .catch((reason) => {
      printProcessError(reason);
      process.exit(1);
    });
};

export { main };
