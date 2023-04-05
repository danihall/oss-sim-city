import fs from "node:fs";
import path from "node:path";

import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
import { REGEX_STRING_FLAVOUR } from "./sourceOfTruth.mjs";

const TSX = ".tsx";
const REGEX_PROP_VARIANT = /([A-Za-z]*\s\|\s[A-Za-z]*)*/g;

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
  return _template`export {${component_name}} from "${path.replace(
    COMPONENTS_PATH,
    PATH_FROM_STYLEGUIDE_TO_COMPONENTS
  )}";`;
};

/**
 * @param {string} file
 * @returns {boolean}
 */
const _makeComponentNameandPathObject = (accumulated_files, file) => {
  if (path.extname(file) !== TSX) {
    return accumulated_files;
  }
  const folder_path = accumulated_files[0];

  return [
    ...accumulated_files,
    { component_name: file.replace(TSX, ""), path: `${folder_path}/${file}` },
  ];
};

/**
 * @param {string} component_folder
 * @returns {Promise} array
 */
const getComponentNameAndPath = async (component_folder) => {
  const folder_path = `${COMPONENTS_PATH}/${component_folder}`;
  const files = await fs.promises.readdir(folder_path);
  const effective_files = files.reduce(_makeComponentNameandPathObject, [
    folder_path,
  ]);

  return effective_files.slice(1);
};

/**
 * @param {array} entry
 * @returns {boolean}
 */
const _isTruthyValue = function ([, value]) {
  return Boolean(value);
};

/**
 * @param {string} prop_key
 * @returns {string}
 */
const _getSuffixForString = (prop_key) => {
  const regex_groups = REGEX_STRING_FLAVOUR.exec(prop_key)?.groups;

  return regex_groups
    ? Object.entries(regex_groups).find(_isTruthyValue)[0]
    : "";
};

/**
 * @param {string} string
 * @returns {array}
 */
const getKeyAndFakeType = (string) => {
  let [prop_key, prop_type] = string.split(":");
  prop_key = prop_key.replace("?", "").trim();
  prop_type = prop_type.replace(/;|"/g, "").trim();
  prop_type += prop_type === "string" ? _getSuffixForString(prop_key) : "";

  return [prop_key, prop_type];
};

/**
 * @param {string | boolean} variant
 * @param {number} index
 * @this {object} prop_name, variant_list
 * @returns {object}
 */
const _addPropVariantInPlace = function (variant, index) {
  return { ...{ [this.prop_name]: variant }, ...this.variant_list[index] };
};

/**
 * @param {array} variant_list
 * @param {array} entry
 * @returns {array}
 */
const getPropsVariations = (variant_list, entry) => {
  const [prop_name, prop_value] = entry;
  const context = { prop_name, variant_list };

  switch (typeof prop_value) {
    case "string": {
      const prop_to_vary = prop_value.match(REGEX_PROP_VARIANT)?.[0];

      return prop_to_vary
        ? prop_to_vary.split(" | ").map(_addPropVariantInPlace, context)
        : variant_list;
    }
    case "boolean": {
      return [true, false].map(_addPropVariantInPlace, context);
    }
    default:
      return variant_list;
  }
};

const printProcessSuccess = (
  process_duration,
  components_name_and_path,
  function_prop_detected
) => {
  console.log(
    `  components exports and render specs created in ${process_duration
      .toString()
      .slice(0, 4)}ms:`
  );
  console.log(
    components_name_and_path
      .map(({ component_name }) => `    <${component_name}/>`)
      .join("\n")
  );
  if (function_prop_detected.length) {
    console.log(
      `  props declaring a Function were discarded:\n    ${function_prop_detected.join(
        "    \n"
      )}\n  Styleguide-automator cannot generate a fake value for these kind of props`
    );
  }
};

const printProcessError = (reason) => {
  console.log(
    `  Styleguide-automator encountered an error:
      ${reason}
  Process exited.`
  );
};

export {
  createExportStatement,
  getComponentNameAndPath,
  getKeyAndFakeType,
  getPropsVariations,
  printProcessSuccess,
  printProcessError,
};
