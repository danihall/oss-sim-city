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
 * @param {array} accumulated_chunks
 * @param {string} current_chunk
 * @param {number} index
 * @returns {array}
 */
const mergeChunksAsKeyValuePair = (
  accumulated_chunks,
  current_chunk,
  index
) => {
  if (index === 0) {
    return [current_chunk];
  }

  const previousChunk = accumulated_chunks.at(-1);
  const open_brackets_count = previousChunk.match(/{/g)?.length;
  const close_brackets_count = previousChunk.match(/}/g)?.length;

  if (open_brackets_count === close_brackets_count) {
    return [...accumulated_chunks, current_chunk];
  }
  return [...accumulated_chunks.slice(0, -1), previousChunk + current_chunk];
};

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

export { getFunctionPropsList, foldersToIgnore, mergeChunksAsKeyValuePair };
