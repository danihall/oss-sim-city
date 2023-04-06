import fs from "node:fs";
import path from "node:path";

import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
import { REGEX_STRING_FLAVOUR } from "./sourceOfTruth.mjs";

const TSX = ".tsx";
const QUESTION_MARK = "?";
const REGEX_TYPE_USELESS_CHAR = /;|"/g;
const REGEX_PROP_VARIANT = /([A-Za-z]*\s\|\s[A-Za-z]*)*/g;
const STRINGS_SEPARATOR = " | ";
const BOOLEANS = [true, false];

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
  const sanitized_path = path.replace(TSX, "");
  return _template`export {${component_name}} from "${sanitized_path.replace(
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
  prop_key = prop_key.replace(QUESTION_MARK, "").trim();
  prop_type = prop_type.replace(REGEX_TYPE_USELESS_CHAR, "").trim();
  const fake_type =
    prop_type === "string"
      ? `${prop_type}${_getSuffixForString(prop_key)}`
      : prop_type;

  return [prop_key, prop_type, fake_type];
};

/**
 * @param {object} entry
 * @this {object} other entry at same index
 * @returns {object}
 */
const addPropVariantInPlace = function (entry) {
  return { ...this, ...entry }; // order is important, entry must override this.
};

/**
 * @param {string | boolean} variant
 * @this {string} prop_name
 * @returns {object}
 */
const _createPropVariant = function (variant) {
  return { [this]: variant };
};

/**
 * @param {array} accumulated_props
 * @param {array} entry: prop_name, prop_value
 * @returns {array}
 */
const getPropsVariations = (accumulated_props, [prop_name, prop_value]) => {
  switch (typeof prop_value) {
    case "string": {
      const prop_to_vary = prop_value.match(REGEX_PROP_VARIANT)?.[0];

      if (prop_to_vary) {
        const splitted = prop_to_vary.split(STRINGS_SEPARATOR);
        const first_variant = { [prop_name]: splitted[0] };

        return [
          ...accumulated_props.map(addPropVariantInPlace, first_variant),
          ...splitted.map(_createPropVariant, prop_name),
        ];
      }
      return accumulated_props;
    }
    case "boolean": {
      const booleans = BOOLEANS.map(_createPropVariant, prop_name);

      if (accumulated_props.length) {
        return [
          ...accumulated_props,
          ...booleans.map(addPropVariantInPlace, accumulated_props[0]),
        ];
      }
      return [...booleans];
    }
    default:
      return accumulated_props;
  }
};

export {
  createExportStatement,
  getComponentNameAndPath,
  getKeyAndFakeType,
  addPropVariantInPlace,
  getPropsVariations,
};
