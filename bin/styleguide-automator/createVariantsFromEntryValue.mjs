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
    ...this.raw_interface,
    [this.key]:
      typeof variant_value === "boolean" || isNaN(variant_value)
        ? variant_value
        : Number(variant_value),
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
        .reduce(createVariantsFromEntryValue, [nested_object])
        .slice(1) // must remove the first item, which is a shallow copy of the parent interface and, as such, a duplicate.
        .map(_makeNewVariant, { raw_interface, key });
    }
    case "string": {
      if (value === BOOLEAN_TYPE) {
        return FALSE_AND_TRUE.map(_makeNewVariant, { raw_interface, key });
      }

      if (value.includes(UNION_OPERATOR)) {
        return value
          .replace(REGEX_UNION, NOTHING)
          .split(UNION_OPERATOR)
          .map(_makeNewVariant, { raw_interface, key });
      }

      if (value.includes(ARRAY_OPERATOR)) {
        const item = value.replace(ARRAY_OPERATOR, NOTHING);
        return [Array(3).fill(item)].map(_makeNewVariant, {
          raw_interface,
          key,
        });
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
 *  const object_variants = Object.entries(createVariantsFromEntryValue, [object_to_be_derived_from]);
 * @param {array} accumulated_variants
 * @param {array} current_key_value
 * @returns {array}
 */
function createVariantsFromEntryValue(accumulated_variants, current_key_value) {
  const raw_interface = accumulated_variants.at(-1);
  const variants_from_value =
    _getVariantsFromValue(raw_interface, current_key_value) ?? [];

  return [...accumulated_variants, ...variants_from_value];
}

const _getVariantsFromOptionalKey = (raw_interface, current_key_value) => {
  const [key, value] = current_key_value;

  if (typeof value === "object") {
    const nested_object = raw_interface[key];
    const nested_optional_keys = Object.entries(nested_object).reduce(
      createVariantsFromOptionalKey,
      [nested_object]
    );
    return nested_optional_keys.map((variant) => {
      const { [key]: _, ...rest } = raw_interface;
      console.log({ variant, rest });
      return rest;
    });
  }

  if (key.includes("?")) {
    const { [key]: _, ...rest } = raw_interface;
    //console.log([rest]);
    return [rest];
  }
};

function createVariantsFromOptionalKey(
  accumulated_variants,
  current_key_value
) {
  const raw_interface = accumulated_variants[0];
  const [key, value] = current_key_value;
  /*
  const variants_from_optional_key =
    _getVariantsFromOptionalKey(raw_interface, current_key_value) ?? [];
    */
  const variants_from_optional_key = [];

  if (key.includes("?")) {
    const { [key]: _, ...rest } = raw_interface;
    variants_from_optional_key.push(rest);
  }

  if (typeof value === "object") {
    const test = Object.entries(value)
      .reduce(createVariantsFromOptionalKey, [value])
      .slice(1);

    test.forEach((nested_variant) => {
      const variant = { ...raw_interface, [key]: nested_variant };
      variants_from_optional_key.push(variant);
    });
  }

  return [...accumulated_variants, ...variants_from_optional_key];
}

export { createVariantsFromEntryValue, createVariantsFromOptionalKey };
