const REGEX_DBL_QUOTE = /"/g;
const REGEX_KEY_VALUE =
  /((?<=:)[^;]+\[\])|((?:(?:\w|")+\|)+(?:\w|")+)|(\w|"|\?)+|(;)/g;
const NOTHING = "";
const COMMA = ",";
const CLOSE_BRACKET = "}";

/**
 * @param {string} match
 * @param {string} capture_array any-chars[]
 * @param {string} capture_disjunction any-chars | any-chars | any-chars
 * @param {string} capture_word any-chars
 * @param {string} _capture_semicolon ;
 * @param  {...any} rest
 * @returns {string}
 */
const _replacer = (
  match,
  capture_array,
  capture_disjunction,
  capture_word,
  _capture_semicolon,
  ...rest
) => {
  if (capture_word || capture_disjunction || capture_array) {
    return `"${match.replace(REGEX_DBL_QUOTE, NOTHING)}"`;
  }

  const [offset, string] = rest;
  const following_char = string[offset + match.length];
  return following_char === CLOSE_BRACKET || !following_char ? NOTHING : COMMA;
};

const makeChunkAsValidJson = (chunk) => {
  return chunk.replace(REGEX_KEY_VALUE, _replacer);
};

export { makeChunkAsValidJson };
