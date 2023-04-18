import { REGEX_STRING_FLAVOUR } from "./_sourceOfTruth.mjs";
import { FOLDERS_TO_PARSE_REGEX } from "./getConfig.mjs";

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
const foldersToIgnore = (folder) => FOLDERS_TO_PARSE_REGEX.test(folder);

/**
 * @param {array} entry
 * @returns {boolean}
 */
const _isTruthyValue = ([, value]) => Boolean(value);

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

/**
 * This custom splitter divides a whole string in two part, even if the separator can be found in multiples places.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/split
 */
const splitKeyAndRestValue = {
  separator: ":",
  /**
   * @param {string} string
   * @returns {array}
   */
  [Symbol.split](string) {
    const first_colon = string.indexOf(this.separator);

    if (!first_colon) {
      return [string];
    }

    return [string.slice(0, first_colon), string.slice(first_colon + 1)];
  },
};

const SplitByKeyValuePairs = {
  regex_separator: /;/g,
  [Symbol.split](string) {
    const commas = [...string.matchAll(this.regex_separator)];

    if (!commas.length) {
      return [string];
    }

    return commas.map((comma, index, array) => {
      return string.slice(array[index - 1]?.index + 1 ?? 0, comma.index + 1);
    });
  },
};

export {
  getFunctionPropsList,
  foldersToIgnore,
  splitKeyAndRestValue,
  SplitByKeyValuePairs,
};
