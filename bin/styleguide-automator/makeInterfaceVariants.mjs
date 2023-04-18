import { groupNestedObjects } from "./groupNestedObjects.mjs";
import { splitKeyAndRestValue, SplitByKeyValuePairs } from "./helpers.mjs";

const OPEN_BRACKET = "{";

/**
 * Recursion used in this function. Hard to follow at a glance,
 * but recursion is the only way to deal with nested props objects.
 * Only possible variants of values are created, not ones stemming from a key, eg: "key?: value".
 * Variants from optional keys are created later when JSON.parsing the arrays created here.
 * @param {string} acc
 * @param {string} cur
 * @param {number} cur_index
 * @returns {array}
 */
const makeVariantsFromValue = (acc, cur, cur_index) => {
  const [key, rest_value] = cur.split(splitKeyAndRestValue);
  const raw_interface = acc[0];
  const variants_from_value = [];
  let temp = undefined;

  if (rest_value.startsWith("{")) {
    const nested = rest_value
      .slice(1)
      .slice(0, -2)
      .split(SplitByKeyValuePairs)
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

export { makeVariantsFromValue };