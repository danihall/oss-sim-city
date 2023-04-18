/**
 * This custom splitter divides a string representing an object into an array of string representing key-value pairs.
 * @note to be used in Array.prototype.split
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/split
 */
const splitByKeyValuePairs = {
  regex_separator: /;/g,
  [Symbol.split](string) {
    const semicolon = [...string.matchAll(this.regex_separator)];

    if (!semicolon.length) {
      return [string];
    }

    return semicolon.map((comma, index, array) => {
      return string.slice(array[index - 1]?.index + 1 ?? 0, comma.index + 1);
    });
  },
};

export { splitByKeyValuePairs };
