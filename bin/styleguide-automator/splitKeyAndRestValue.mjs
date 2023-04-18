/**
 * This custom splitter divides a whole string in two part, even if the separator can be found in multiples places.
 * @note to be used in Array.prototype.split
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

export { splitKeyAndRestValue };
