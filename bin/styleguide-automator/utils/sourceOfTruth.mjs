const REGEX_IS_TEXT = /text|content/;
const REGEX_IS_PATH = /path|url/;

/**
 * This object will be mutated, gradually receiving new keys as getters.
 * The added getters will use the function defined below to create fake values for the styleguide.
 * When JSON.stringify is used, it deletes all plain functions, and executes getters.
 * So once stringified, this object will serve as data to populate each component with the correct props.
 */
const SOURCE_OF_TRUTH = {
  boolean() {
    return true;
  },
  number() {
    return +performance.now().toString().slice(-5);
  },
  string_text() {
    return "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter.";
  },
  string_attr() {
    return `attr-${this.number()}`;
  },
  string_path() {
    return "https://placehold.co/600x400/png";
  },
  "React.ReactNode"() {
    return "Text that can be contained in a HTMLElement";
  },
};

export { SOURCE_OF_TRUTH, REGEX_IS_TEXT, REGEX_IS_PATH };
