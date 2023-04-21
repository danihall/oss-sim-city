import fs from "node:fs";
import process from "node:process";

import { SOURCE_OF_TRUTH } from "./_sourceOfTruth.mjs";
import { createExportStatement } from "./createExportStatement.mjs";
import {
  createVariantsFromEntryValue,
  createVariantsFromOptionalKey,
} from "./createVariantsFromEntryValue.mjs";
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
 * Some "meta-programming" is done when setting properties on SOURCE_OF_TRUTH.
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

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_match = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(HINT_EXTENDS);

    if (interface_match) {
      let interface_as_string = "";
      interface_name = interface_match[0];
      extended_interface = interface_match.length > 1 && interface_match[1];

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] === CLOSE_BRACKET) {
          const raw_interface = JSON.parse(
            sanitizeToParsableJson(interface_as_string)
          );

          const interface_value_variants = Object.entries(raw_interface).reduce(
            createVariantsFromEntryValue,
            [raw_interface]
          );
          const interface_optional_key_variants = Object.entries(
            raw_interface
          ).reduce(createVariantsFromOptionalKey, [raw_interface]);
          console.log(JSON.stringify(interface_optional_key_variants, null, 3));

          //const raw_props = JSON.parse(`{${fake_props_as_string}}`);
          //const fake_props = JSON.parse(`{${fake_props_as_string}}`, _reviver);

          /**
           * Adds a function in SOURCE_OF_TRUTH for the interface that will be called automatically at JSON.stringify time.
           * This interface is separated from the component so it can be accessed by other components.
           */
          /*
          Object.defineProperty(SOURCE_OF_TRUTH, interface_name, {
            value: () => ({
              ...SOURCE_OF_TRUTH[extended_interface]?.(),
              ...fake_props,
            }),
          });

          // Adds the final infos and fake props (generated from the interface) of the component.
          Object.defineProperty(SOURCE_OF_TRUTH, component_name, {
            enumerable: true,
            get() {
              return {
                info: {
                  interface_name,
                  raw_props,
                },
                get fake_props() {
                  if (!(interface_name in SOURCE_OF_TRUTH)) {
                    return null;
                  }

                  const fake_props = SOURCE_OF_TRUTH[interface_name]();
                  const fake_props_variations = Object.entries(
                    fake_props
                  ).reduce(getPropsVariations, []);

                  return fake_props_variations.length
                    ? fake_props_variations.map(
                        addPropVariantInPlace,
                        fake_props
                      )
                    : [fake_props];
                },
              };
            },
          });
          */

          break parent_loop;
        }

        interface_as_string += content_as_array[j];

        /*
        interface_as_array.push(
          content_as_array[j].replace(REGEX_SPACE, NOTHING)
        );
        */

        /*
        // Getters need to be set with "enumerable: true" or they won't be accessed at JSON.stringify time
        Object.defineProperty(context, prop_key, {
          enumerable: true,
          get: () =>
            fake_type in SOURCE_OF_TRUTH
              ? SOURCE_OF_TRUTH[fake_type]()
              : _getFakeValueFromUserType(fake_type),
        });
        */
      }
    }
  }
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

  const components_export_statements = components_name_and_path
    .map(createExportStatement)
    .join("");

  Promise.all(components_name_and_path.map(_updateSourceOfTruth))
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
};

export { main };
