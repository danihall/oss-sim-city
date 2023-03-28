const REGEX_TEXT = /text|content/;

const SOURCE_OF_TRUTH = {
  boolean(_key_name) {
    return true;
  },
  number(_key_name) {
    return +performance.now().toString().slice(-5);
  },
  string(key_name) {
    return REGEX_TEXT.test(key_name)
      ? "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter."
      : `attr-${this.number()}`;
  },
  "React.ReactNode"(_key_name) {
    return "Text that can be contained in a HTMLElement";
  },
};

export { SOURCE_OF_TRUTH };
