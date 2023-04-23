const BOOLEAN_TYPE = "boolean";
const NOTHING = "";
const UNION_OPERATOR = "|";
const ARRAY_OPERATOR = "[]";
const REGEX_UNION = /\(|\)|\[\]/g;
const FALSE_AND_TRUE = [false, true];

/**
 * @param {string | object | boolean} new_value
 * @this {object} raw_interface, key
 * @returns {object}
 */
const _makeNewVariant = function (variant_value) {
  return {
    ...this.model_interface,
    [this.key]:
      typeof variant_value === "boolean" || isNaN(variant_value)
        ? variant_value
        : Number(variant_value),
  };
};

/**
 * @param {object} model_interface
 * @param {array} current_key_value
 * @returns {array | undefined}
 */
const _getVariantsFromKeyAndValue = (model_interface, current_key_value) => {
  const [key, value] = current_key_value;

  let temp = undefined;
  const variants_from_optional_key = key.includes("?")
    ? (({ [key]: temp, ...temp } = model_interface), [temp])
    : [];

  switch (typeof value) {
    case "object": {
      const model_nested_interface = model_interface[key];
      const variants_from_nested_object = Object.entries(value)
        .reduce(createVariantsFromEntry, [model_nested_interface])
        .slice(1) // must remove the first item, which is a shallow copy of the parent interface and, as such, a duplicate.
        .map(_makeNewVariant, { model_interface, key });
      return [...variants_from_optional_key, ...variants_from_nested_object];
    }
    case "string": {
      if (value === BOOLEAN_TYPE) {
        const variants_from_boolean = FALSE_AND_TRUE.map(_makeNewVariant, {
          model_interface,
          key,
        });
        return [...variants_from_optional_key, ...variants_from_boolean];
      }

      if (value.includes(UNION_OPERATOR)) {
        const variants_from_disjunction = value
          .replace(REGEX_UNION, NOTHING)
          .split(UNION_OPERATOR)
          .map(_makeNewVariant, { model_interface, key });
        return [...variants_from_optional_key, ...variants_from_disjunction];
      }

      if (value.includes(ARRAY_OPERATOR)) {
        const item = value.replace(ARRAY_OPERATOR, NOTHING);
        const variant_array = [Array(3).fill(item)].map(_makeNewVariant, {
          model_interface,
          key,
        });
        return [...variants_from_optional_key, variant_array[0]];
      }
    }
  }
};

/**
 * Must use recursion to handle unknowable nested object.
 * @note this function only works if an array of arrays of key-value pairs is fed,
 * with an array containing the object to be derived from given as the initial value.
 * @example
 *  const object_to_be_derived_from = {...};
 *  const object_variants = Object.entries(createVariantsFromEntry, [object_to_be_derived_from]);
 * @param {array} accumulated_variants
 * @param {array} current_key_value
 * @returns {array}
 */
function createVariantsFromEntry(accumulated_variants, current_key_value) {
  const model_interface = accumulated_variants[0];
  const variants =
    _getVariantsFromKeyAndValue(model_interface, current_key_value) ?? [];

  return [...accumulated_variants, ...variants];
}

export { createVariantsFromEntry };
