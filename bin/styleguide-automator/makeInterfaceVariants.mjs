/**
 * Must use recursion to handle unknowable nested object.
 * @note this function only works if an array of arrays of key-value pairs is fed.
 * @example
 *  const object_to_parse = {...};
 *  const object_variants = Object.entries(makeVariantsFromValue, [object_to_parse]);
 * @param {array} accumulated_variants
 * @param {array} current_key_value
 * @returns {array}
 */
const makeVariantsFromValue = (accumulated_variants, current_key_value) => {
  const [key, value] = current_key_value;
  const raw_interface = accumulated_variants[0];
  const variants = [];

  if (typeof value === "object") {
    const nested_object = raw_interface[key];

    Object.entries(nested_object)
      .reduce(makeVariantsFromValue, [nested_object])
      .slice(1) // must remove the first item, which is a shallow copy of the parent interface and, as such, a duplicate.
      .forEach((variant) => {
        const nested_variant = { ...raw_interface, [key]: variant };
        variants.push(nested_variant);
      });
  }

  if (value === "boolean") {
    const variant_true = { ...raw_interface, [key]: true };
    const variant_false = { ...raw_interface, [key]: false };

    variants.push(variant_true, variant_false);
  }

  if (value.includes("")) {
    return [...accumulated_variants, ...variants];
  }
};

export { makeVariantsFromValue };
