const REGEX_SPACE = /\s/g;
const REGEX_CAPTURE_KEY_VALUE =
  /((?<=:)[^;]+\[\])|((?:(?:\w|"|\d)+\|)+(?:\w|"|\d)+)|((?<=:)\d+)(?=;)|(\w|"|\d|\?)+|(;)/g;
const REGEX_DBL_QUOTE = /"/g;
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
const _toValidJson = (
  match,
  capture_array,
  capture_disjunction,
  capture_digits,
  capture_word,
  _capture_semicolon,
  ...rest
) => {
  if (capture_word || capture_disjunction || capture_array) {
    return `"${match.replace(REGEX_DBL_QUOTE, "'")}"`;
  }

  if (capture_digits) {
    return match;
  }

  const [offset, string] = rest;
  const following_char = string[offset + match.length];
  return following_char === CLOSE_BRACKET || !following_char ? NOTHING : COMMA;
};

const sanitizeToParsableJson = (string) => {
  return `{${string
    .replace(REGEX_SPACE, NOTHING)
    .replace(REGEX_CAPTURE_KEY_VALUE, _toValidJson)}}`;
};

export { sanitizeToParsableJson };
