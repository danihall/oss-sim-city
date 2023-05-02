import fs from "node:fs";
import process from "node:process";

import { SOURCE_OF_TRUTH } from "./_sourceOfTruth.mjs";
import { createExportStatement } from "./createExportStatement.mjs";
import { createVariantsFromEntry } from "./createVariantsFromEntryValue.mjs";
import { getComponentNameAndPath } from "./getComponentNamesAndPath.mjs";
import { COMPONENTS_PATH } from "./getConfig.mjs";
import {
  getPropsVariations,
  addPropVariantInPlace,
} from "./getPropsVariations.mjs";
import { getFunctionPropsList, foldersToIgnore } from "./helpers.mjs";
import { createStyleguideDirectory } from "./makeStyleguideDirectory.mjs";
import { printProcessSuccess, printProcessError } from "./printProcess.mjs";
import { sanitizeToParsableJson } from "./sanitizeToParsableJson.mjs";

const REGEX_INTERFACE = /(?<=interface\s)([aA-zZ]|[\s](?!{))+/;
const HINT_FOREIGN_INTERFACE = "use@";
const CLOSE_BRACKET = "}";
const HINT_EXTENDS = " extends ";
const HINT_ARRAY = "[]";

/**
 * It's here that fake props value are set, derived from their documented type ("string", "number", a custom Interface, etc).
 * @param {string} prop_key
 * @param {string} prop_type
 * @this {object} SOURCE_OF_TRUTH
 * @returns {array}
 */
const _getFakeValueFromUserType = function (prop_type) {
  const is_array_of_types = prop_type.slice(-2) === HINT_ARRAY;
  const value_generator = is_array_of_types
    ? SOURCE_OF_TRUTH[prop_type.slice(0, -2)]
    : SOURCE_OF_TRUTH[prop_type];

  let fake_value = is_array_of_types
    ? Array.from({ length: 5 }, () => value_generator?.())
    : value_generator?.();

  if (!fake_value) {
    fake_value = isNaN(prop_type) ? prop_type : Number(prop_type);
  }
  return fake_value;
};

/**
 * @param {string} key
 * @param {string} value
 * @returns {string | object}
 */
const _removeDisjunctionAndList = function (_, value) {
  if (typeof value === "string") {
    let value_to_insert = value;

    if (value.startsWith(HINT_FOREIGN_INTERFACE)) {
      //const context = this;//eslint-disable-line
      const foreign_interface =
        this[`${value.replace(HINT_FOREIGN_INTERFACE, "")}_json`];
      value_to_insert = foreign_interface;
      /*
      value_to_insert = JSON.parse(
        foreign_interface,
        _removeDisjunctionAndList.bind(this)
      );
      */
    }

    if (value.includes("[]")) {
      value_to_insert = [value.match(/(?:'|\w|\d)+/)[0]];
    } else if (value.includes("|")) {
      value_to_insert = value.slice(0, value.indexOf("|"));
    }
    return isNaN(value_to_insert) ? value_to_insert : Number(value_to_insert);
  }

  return value;
};

/**
 * Some "meta-programming" is done when setting properties on SOURCE_OF_TRUTH.
 * Getters and functions are added to SOURCE_OF_TRUTH object.
 * When applying JSON.stringify() on SOURCE_OF_TRUTH, getters will be accessed and functions|undefined will then be discarded. (undefined will be discarde when in an object)
 * We can take advantage of this and output a json file with values that have been created dynamically at "stringify time".
 * @param {string} component_name
 * @param {string} path
 */
const getInterfaceFromFile = async ({ component_name, path }) => {
  /** Could use createReadStream() and readLine(), but files are expected to be small. */
  const content_as_array = await fs.promises
    .readFile(path, "utf-8")
    .then((content) => content.split("\n"));

  const component = {
    component_name,
    interface_name: undefined,
    extended_interface_name: undefined,
    interface_as_json: undefined,
  };

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_match = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(HINT_EXTENDS);

    if (interface_match) {
      component.interface_name = interface_match[0];
      component.extended_interface_name = interface_match[1];
      let interface_as_string = "";

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] === CLOSE_BRACKET) {
          component.interface_as_json = sanitizeToParsableJson(
            interface_as_string,
            component.extended_interface_name ?? ""
          );
          /*
          const interface_variants = Object.entries(raw_interface).reduce(
            createVariantsFromEntry,
            [model_interface]
          );
          */
          break parent_loop;
        }

        interface_as_string += content_as_array[j];
      }
    }
  }
  return component;
};

/**
 * @see package.json
 */
const main = async () => {
  const t1 = performance.now();
  const component_folders = await fs.promises
    .readdir(COMPONENTS_PATH)
    .then((folders) => folders.filter(foldersToIgnore));

  const components_name_and_path = await Promise.all(
    component_folders.map(getComponentNameAndPath)
  ).then((result) => result.flat());

  const [export_statements, ...components_interfaces] = await Promise.all([
    components_name_and_path.map(createExportStatement),
    ...components_name_and_path.map(getInterfaceFromFile),
  ]);

  /*
  Object.entries(raw_interface).reduce(createVariantsFromEntry, [
    model_interface,
  ]);
  */
  const test = {};
  components_interfaces.forEach(({ interface_name, interface_as_json }) => {
    test[`${interface_name}_json`] = interface_as_json;
  });

  components_interfaces.forEach(({ interface_name }) => {
    const obj = JSON.parse(
      test[`${interface_name}_json`],
      _removeDisjunctionAndList.bind(test)
    );
    console.log(obj);
  });

  /*
  components_interfaces.forEach((component) => {
    const {
      component_name,
      interface_name,
      extended_interface_name,
      interface_as_json,
    } = component;
    const raw_interface = JSON.parse(interface_as_json);
    const model_interface = JSON.parse(
      interface_as_json,
      _removeDisjunctionAndList.bind(test)
    );

    Object.defineProperties(test, {
      [component_name]: {
        enumerable: true,
        get() {
          return this[interface_name]?.();
        },
      },
      [interface_name]: {
        enumerable: true,
        value: function () {
          const extended_interface = this[extended_interface_name]?.();

          return {
            raw_interface: {
              ...extended_interface?.raw_interface,
              ...raw_interface,
            },
            model_interface: {
              ...extended_interface?.model_interface,
              ...model_interface,
            },
          };
        },
      },
    });
  });
  */

  //console.log(export_statements, test.MessageAsLink);

  /*
  Promise.all([
    ...components_name_and_path.map(getInterfaceFromFile),
    components_name_and_path.map(createExportStatement),
  ])
    .then((result) => console.log(result))
    .then(() => createStyleguideDirectory())
    .then((styleguide_path) =>
      Promise.all([
        fs.promises.writeFile(
          `${styleguide_path}/index.ts`,
          components_export_statements
        ),
        fs.promises.writeFile(
          `${styleguide_path}/componentsToRender.json`,
          JSON.stringify(SOURCE_OF_TRUTH, null, 2)
        ),
      ])
    )
    .then(() => {
      printProcessSuccess(
        performance.now() - t1,
        components_name_and_path,
        getFunctionPropsList()
      );
    })
    .catch((reason) => {
      printProcessError(reason);
      process.exit(1);
    });
    */
};

export { main };
