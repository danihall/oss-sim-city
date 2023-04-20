import { groupNestedObjects } from "./groupNestedObjects.mjs";
import { splitKeyAndRestValue } from "./splitKeyAndRestValue.mjs";

const OPEN_BRACKET = "{";

/**
 * Recursion used in this function. Hard to follow at a glance, but recursion is the only way to deal with nested props objects.
 * Only possible variants of values are created, not ones stemming from an optional key, eg: "key?: value".
 * Variants from optional keys are created in a second pass.
 * @param {string} acc
 * @param {string} cur
 * @param {number} cur_index
 * @returns {array}
 */
/*
const makeVariantsFromValue = (acc, cur, cur_index) => {
  const [key, rest_value] = cur.split(splitKeyAndRestValue);
  const raw_interface = acc[0];
  const variants_from_value = [];
  let temp = undefined;

  if (rest_value.startsWith("{")) {
    const nested = rest_value
      .slice(1)
      .slice(0, -2)
      .split(splitByKeyValuePairs)
      .reduce(groupNestedObjects, []);
    const nested_variants = nested
      .reduce(makeVariantsFromValue, [nested])
      .slice(1);

    nested_variants.forEach((nested_variant) => {
      const variant =
        ((temp = [...raw_interface]),
        (temp[cur_index] = `${key}:{${nested_variant};}`),
        temp);

      variants_from_value.push(variant);
    });
  } else if (rest_value === "boolean;") {
    const variant_true =
      ((temp = [...raw_interface]), (temp[cur_index] = `${key}:true;`), temp);
    const variant_false =
      ((temp = [...raw_interface]), (temp[cur_index] = `${key}:false;`), temp);

    variants_from_value.push(variant_true, variant_false);
  } else if (rest_value.includes("|")) {
    const values = rest_value.replace(/\(|\)|\[]|;/g, "").split("|");
    values.forEach((value) => {
      const variant =
        ((temp = [...raw_interface]),
        (temp[cur_index] = `${key}:${value};`),
        temp);

      variants_from_value.push(variant);
    });
  } else if (rest_value.includes("[]")) {
    const item = rest_value.match(/\w+/)?.[0];
    const variant =
      ((temp = [...raw_interface]),
      (temp[
        cur_index
      ] = `${key}:[${item}, ${item}, ${item}, ${item}, ${item}];`),
      temp);

    variants_from_value.push(variant);
  }

  return [...acc, ...variants_from_value];
};
*/

const makeVariantsFromValue = (acc, cur) => {
  const [key, value] = cur;
  const raw_interface = acc[0];
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

  //if ( value.includes("") )

  return [...acc, ...variants];
};

export { makeVariantsFromValue };
