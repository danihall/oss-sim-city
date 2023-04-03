import fs from "node:fs";
import path from "node:path";

import c from "chalk";

import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
import { REGEX_STRING_FLAVOUR } from "./sourceOfTruth.mjs";

const TSX = ".tsx";
const PROP_KEY = '.":';
const REGEX_PROP_KEY = new RegExp(PROP_KEY);
const REGEX_PROPS_VARIATIONS = new RegExp(
  `(?<boolean>${PROP_KEY}true)|(?<static_strings>${PROP_KEY}"(\\\\"[A-Za-z]*\\\\")(\\s\\|\\s\\\\"[A-Za-z]*\\\\")*")`, // backslashes need to be double-ecaped in Regex constructor using emplate string.
  "g"
);

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
const _makeComponentNameandPathObject = (acc, file) => {
  if (path.extname(file) !== TSX) {
    return acc;
  }

  const folder_path = acc[0];
  return [
    ...acc,
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
const _isTruthyValue = function (entry) {
  const [, value] = entry;
  return Boolean(value);
};

/**
 * @param {string} prop_key
 * @returns {string}
 */
const getSuffix = (prop_key) => {
  const regex_groups = REGEX_STRING_FLAVOUR.exec(prop_key)?.groups || {};
  const [matched_group] = Object.entries(regex_groups).find(_isTruthyValue);
  return matched_group || "";
};

const PROP_VARIANT_MAP = {
  boolean(value, props_serialized) {
    const prop_name = value.match(REGEX_PROP_KEY)[0];
    return JSON.parse(props_serialized.replace(value, `${prop_name}${!value}`));
  },
  static_strings(value, props_serialized) {
    const prop_name = value.match(REGEX_PROP_KEY)[0];

    return value
      .replace(prop_name, "")
      .split("|")
      .map((string) => {
        const string_variant = string.replace(/[^A_Za-z]/g, "");

        return JSON.parse(
          props_serialized.replace(value, `${prop_name}"${string_variant}"`)
        );
      });
  },
};

/**
 * @param {object} props
 * @returns {array}
 */
const createPossiblePropsVariants = (props) => {
  const props_serialized = JSON.stringify(props);

  return Array.from(
    props_serialized.matchAll(REGEX_PROPS_VARIATIONS),
    ({ groups }) => Object.entries(groups).find(_isTruthyValue)
  ).flatMap(([matched_group, matched_value]) => {
    return PROP_VARIANT_MAP[matched_group](matched_value, props_serialized);
  });
};

const printProcessSuccess = (
  process_duration,
  components_name_and_path,
  function_prop_detected
) => {
  console.log(
    c.blueBright.bold(
      `  components exports and render specs created in ${process_duration
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
  if (function_prop_detected.length) {
    console.log(
      c.yellow(
        `  props declaring a Function were discarded:\n    ${function_prop_detected.join(
          "    \n"
        )}\n  Styleguide-automator cannot generate a fake value for these kind of props`
      )
    );
  }
};

const printProcessError = (reason) => {
  console.log(
    c.red(`  Styleguide-automator encountered an error:
      ${reason}
  Process exited.`)
  );
};

export {
  createExportStatement,
  getComponentNameAndPath,
  getSuffix,
  createPossiblePropsVariants,
  printProcessSuccess,
  printProcessError,
};
