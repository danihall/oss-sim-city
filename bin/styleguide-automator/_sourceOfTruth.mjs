const REGEX_STRING_FLAVOUR =
  /(?<_attr>id|key)|(?<_text>text|content)|(?<_path>path|url)|(?<_date>date)/i;

const IMAGES = [
  "https://placehold.co/600x400/png",
  "https://placehold.co/600x400/ff0000",
  "https://placehold.co/600x400/00ff00",
  "https://placehold.co/600x400/0000ff",
  "https://placehold.co/600x400/ffff00",
  "https://placehold.co/600x400/ff00ff",
  "https://placehold.co/600x400/00ffff",
  "https://placehold.co/600x400/808080",
  "https://placehold.co/600x400/ffffff",
  "https://placehold.co/600x400/000000",
];

/**
 * This object will be mutated, gradually receiving new keys as getters.
 * The added getters will use the function defined below to create fake values for the styleguide.
 * When JSON.stringify is used, it deletes all plain functions, and executes getters.
 * So once stringified, this object will serve as data to populate each component with the correct props.
 */
const SOURCE_OF_TRUTH = {
  boolean() {
    return this.number() % 2 === 0;
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
    const random_index = Math.floor(Math.random() * IMAGES.length);
    return IMAGES[random_index];
  },
  string_text() {
    return "Bacon ipsum dolor amet buffalo prosciutto corned beef ribeye, jerky shoulder cow short ribs frankfurter. Picanha swine rump jerky ground round kevin pastrami alcatra pork belly tenderloin cupim spare ribs ham frankfurter jowl.";
  },
  "React.ReactNode"() {
    return "Text that can be contained in a HTMLElement";
  },
};

export { SOURCE_OF_TRUTH, REGEX_STRING_FLAVOUR };
