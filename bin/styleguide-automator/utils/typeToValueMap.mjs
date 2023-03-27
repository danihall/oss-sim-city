const TYPE_TO_VALUE_MAP = {
  get boolean() {
    return true;
  },
  get number() {
    return +performance.now().toString().slice(-5);
  },
  get string_short() {
    return `attr-${this.number}`;
  },
  string_long:
    "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter.",
  get ReactNode() {
    return "Text that can be contained in a HTMLElement";
  },
};

export { TYPE_TO_VALUE_MAP };
