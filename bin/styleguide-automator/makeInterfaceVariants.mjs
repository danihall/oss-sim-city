import { groupNestedObjects } from "./groupNestedObjects.mjs";
import {
  splitKeyAndRestValue,
  SplitByCommaAndKeepSeparator,
} from "./helpers.mjs";

const OPEN_BRACKET = "{";

const makeVariantsFromValue = (acc, cur, cur_index, base_array) => {
  const [key, rest_value] = cur.split(splitKeyAndRestValue);
  const raw_interface = acc[0];
  const variant_from_optional_key = [];
  const variants_from_value = [];
  let temp = undefined;

  if (key.includes("?")) {
    variant_from_optional_key.push(
      raw_interface
        .slice(0, cur_index)
        .concat(raw_interface.slice(cur_index + 1))
    );
  }

  if (rest_value === "boolean;") {
    const variant_true =
      ((temp = [...raw_interface]), (temp[cur_index] = `${key}:true;`), temp);
    const variant_false =
      ((temp = [...raw_interface]), (temp[cur_index] = `${key}:false;`), temp);

    variants_from_value.push(variant_true, variant_false);
  }

  if (rest_value.includes("|")) {
    const values = rest_value.replace(/\(|\)|\[]|;/g, "").split("|");
    values.forEach((value) => {
      const variant =
        ((temp = [...raw_interface]),
        (temp[cur_index] = `${key}:${value};`),
        temp);

      variants_from_value.push(variant);
    });
  }

  if (rest_value.includes("[]")) {
    const item = rest_value.match(/\w+/)?.[0];
    const variant =
      ((temp = [...raw_interface]),
      (temp[
        cur_index
      ] = `${key}:[${item}, ${item}, ${item}, ${item}, ${item}];`),
      temp);

    variants_from_value.push(variant);
  }

  return [...acc, ...variant_from_optional_key, ...variants_from_value];
};

export { makeVariantsFromValue };
