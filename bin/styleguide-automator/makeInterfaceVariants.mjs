const NOTHING = "";
const UNION_OPERATOR = "|";
const REGEX_UNION = /\(|\)|\[\]/g;

const FALSE_AND_TRUE = [false, true];

/**
 * @param {string | object} new_value
 * @this {object} raw_interface, key
 * @returns {object}
 */
const _makeObjectVariant = function (new_value) {
  let variant_value = new_value;
  if (typeof variant_value == "string") {
    variant_value = isNaN(variant_value)
      ? variant_value
      : parseFloat(new_value);
  }
  return {
    ...this.raw_interface,
    [this.key]: variant_value,
  };
};

/**
 * @param {object} raw_interface
 * @param {array} current_key_value
 * @returns {array | undefined}
 */
const _getVariantsFromValue = (raw_interface, current_key_value) => {
  const [key, value] = current_key_value;

  switch (typeof value) {
    case "object": {
      const nested_object = raw_interface[key];

      return Object.entries(nested_object)
        .reduce(createVariantsFromValue, [nested_object])
        .slice(1) // must remove the first item, which is a shallow copy of the parent interface and, as such, a duplicate.
        .map(_makeObjectVariant, { raw_interface, key });
    }
    case "string": {
      if (value === "boolean") {
        return FALSE_AND_TRUE.map(_makeObjectVariant, { raw_interface, key });
      }

      if (value.includes(UNION_OPERATOR)) {
        return value
          .replace(REGEX_UNION, NOTHING)
          .split(UNION_OPERATOR)
          .map(_makeObjectVariant, { raw_interface, key });
      }
    }
  }
};
/**
 * Must use recursion to handle unknowable nested object.
 * @note this function only works if an array of arrays of key-value pairs is fed.
 * @example
 *  const object_to_parse = {...};
 *  const object_variants = Object.entries(createVariantsFromValue, [object_to_parse]);
 * @param {array} accumulated_variants
 * @param {array} current_key_value
 * @returns {array}
 */
function createVariantsFromValue(accumulated_variants, current_key_value) {
  const raw_interface = accumulated_variants[0];
  const variants =
    _getVariantsFromValue(raw_interface, current_key_value) ?? [];

  return [...accumulated_variants, ...variants];
}

export { createVariantsFromValue };
