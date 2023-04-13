import { IGNORE_ALL_BUT_REGEX } from "./getConfig.mjs";
import { REGEX_STRING_FLAVOUR } from "./sourceOfTruth.mjs";

const REGEX_USELESS_CHAR = /\s|;|"/g;
const HINT_FUNCTION = "=>";
const function_prop_detected = [];

/**
 * @returns {array}
 */
const getFunctionPropsList = () => function_prop_detected;

/**
 * @param {string} folder
 * @returns {boolean}
 */
const foldersToIgnore = (folder) => {
  return !IGNORE_ALL_BUT_REGEX.test(folder);
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
 * @returns {object}
 */
const getKeyAndFakeType = (string) => {
  if (string.includes(HINT_FUNCTION)) {
    function_prop_detected.push(string);
    return { function_detected: true };
  }

  const [prop_key, prop_type] = string
    .replace(REGEX_USELESS_CHAR, "")
    .trim()
    .split(":");

  const fake_type =
    prop_type === "string"
      ? `${prop_type}${_getSuffixForString(prop_key)}`
      : prop_type;

  return { prop_key, prop_type, fake_type };
};

export { getFunctionPropsList, foldersToIgnore, getKeyAndFakeType };
