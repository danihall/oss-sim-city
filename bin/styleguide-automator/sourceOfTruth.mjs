const REGEX_STRING_FLAVOUR =
  /(?<_attr>id|key)|(?<_text>text|content)|(?<_path>path|url)|(?<_date>date)/i;

/**
 * This object will be mutated, gradually receiving new keys as getters.
 * The added getters will use the function defined below to create fake values for the styleguide.
 * When JSON.stringify is used, it deletes all plain functions, and executes getters.
 * So once stringified, this object will serve as data to populate each component with the correct props.
 */
const SOURCE_OF_TRUTH = {
  boolean_true() {
    return true;
  },
  boolean_false() {
    return false;
  },
  number() {
    return +performance.now().toString().slice(-5);
  },
  string() {
    return "Jerky in do qui turducken sed aliquip."; // default fake value.
  },
  string_attr() {
    return `attr-${this.number()}`;
  },
  string_date() {
    return Intl.DateTimeFormat("fr", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(Date.now());
  },
  string_path() {
    return "https://placehold.co/600x400/png";
  },
  string_text() {
    return "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter. Picanha swine rump jerky ground round kevin pastrami alcatra pork belly tenderloin cupim spare ribs ham frankfurter jowl.";
  },
  "React.ReactNode"() {
    return "Text that can be contained in a HTMLElement";
  },
};

export { SOURCE_OF_TRUTH, REGEX_STRING_FLAVOUR };
