const REGEX_IS_TEXT = /text|content/;
const REGEX_IS_PATH = /path|url/;

const SOURCE_OF_TRUTH = {
  get boolean() {
    return true;
  },
  get number() {
    return +performance.now().toString().slice(-5);
  },
  get string_text() {
    return "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter.";
  },
  get string_attr() {
    return `attr-${this.number}`;
  },
  get string_path() {
    return "https://placehold.co/600x400/png";
  },
  get "React.ReactNode"() {
    return "Text that can be contained in a HTMLElement";
  },
};

export { SOURCE_OF_TRUTH, REGEX_IS_TEXT, REGEX_IS_PATH };
