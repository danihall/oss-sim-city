const REGEX_SPACE = /\s/g;
const REGEX_CAPTURE_KEY_VALUE =
  /(?:\(|\w|"|\?|\d|\||\)|@)+\[\]|(?:(?:\w|"|\d|@)+\|)+(?:\w|"|\d|@)+|(?:\w|"|\?|\d|@)+|(;)/g;
const REGEX_FOREIGN_INTERFACE =
  /(?<=:|\||\()(?!(number|string|boolean))\w\w+(?=;|\[\]|\||\))/g;
const REGEX_DBL_QUOTE = /"/g;
const SINGLE_QUOTE = "'";
const NOTHING = "";
const USE_INTERFACE = "use@";
const COMMA = ",";
const CLOSE_BRACKET = "}";

/**
 * @param {string} match
 * @param {string} capture_semicolon
 * @param  {array} rest
 * @returns {string}
 */
const _toValidJson = (match, capture_semicolon, ...rest) => {
  if (!capture_semicolon) {
    return `"${match.replace(REGEX_DBL_QUOTE, SINGLE_QUOTE)}"`;
  }

  const [offset, string] = rest;
  const following_char = string[offset + match.length];
  return following_char === CLOSE_BRACKET || !following_char ? NOTHING : COMMA;
};

/**
 * @param {string} interface_as_string
 * @param {string} possible_extended_interface
 * @returns {string}
 */
const sanitizeToParsableJson = (interface_as_string) => {
  return `{ ${interface_as_string
    .replace(REGEX_SPACE, NOTHING)
    .replace(REGEX_FOREIGN_INTERFACE, USE_INTERFACE + "$&")
    .replace(REGEX_CAPTURE_KEY_VALUE, _toValidJson)} }`;
};

export { sanitizeToParsableJson };
