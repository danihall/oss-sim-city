const REGEX_PROP_VARIANT = /([A-Za-z]*\s\|\s[A-Za-z]*)*/g;
const STRINGS_SEPARATOR = " | ";
const BOOLEANS = [true, false];

/**
 * @param {object} entry
 * @this {object} other entry at same index
 * @returns {object}
 */
const addPropVariantInPlace = function (entry) {
  return { ...this, ...entry }; // order is important, entry must override this.
};

/**
 * @param {string | boolean} variant
 * @this {string} prop_name
 * @returns {object}
 */
const _createPropVariant = function (variant) {
  return { [this]: variant };
};

/**
 * @param {array} accumulated_props
 * @param {array} entry: prop_name, prop_value
 * @returns {array}
 */
const getPropsVariations = (accumulated_props, [prop_name, prop_value]) => {
  switch (typeof prop_value) {
    case "string": {
      const prop_to_vary = prop_value.match(REGEX_PROP_VARIANT)?.[0];

      if (prop_to_vary) {
        const splitted = prop_to_vary.split(STRINGS_SEPARATOR);
        const first_variant = { [prop_name]: splitted[0] };

        return [
          ...accumulated_props.map(addPropVariantInPlace, first_variant),
          ...splitted.map(_createPropVariant, prop_name),
        ];
      }
      return accumulated_props;
    }
    case "boolean": {
      const booleans = BOOLEANS.map(_createPropVariant, prop_name);

      if (accumulated_props.length) {
        return [
          ...accumulated_props,
          ...booleans.map(addPropVariantInPlace, accumulated_props[0]),
        ];
      }
      return [...booleans];
    }
    default:
      return accumulated_props;
  }
};

export { getPropsVariations, addPropVariantInPlace };
