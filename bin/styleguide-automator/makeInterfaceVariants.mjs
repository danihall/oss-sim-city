import {
  splitKeyAndRestValue,
  SplitByCommaAndKeepSeparator,
} from "./helpers.mjs";
import { mergeChunksAsKeyValuePair } from "./mergeChunksAsKeyValuePair.mjs";

const OPEN_BRACKET = "{";

const makeVariants = function (acc, cur, cur_index, array) {
  const [key, value] = cur.split(splitKeyAndRestValue);

  if (value[0] === OPEN_BRACKET) {
    console.log(value.slice(1).slice(0, -1));
    const value_array = value
      .slice(1)
      .slice(0, -1)
      .split(SplitByCommaAndKeepSeparator)
      .reduce(mergeChunksAsKeyValuePair, []);
    console.log(value_array);
    //console.log(value_array);
    const variant = value_array.reduce(makeVariants, acc);
    //console.log({ value, variant });
    return [...acc, ...variant];
  }

  /*
  if (key.includes("?")) {
    const variantOptionalKey = array.filter(
      (item, index) => index !== cur_index
    );
    //console.log({ variantOptionalKey });
    //acc.push(variantOptionalKey);
    console.log({ acc });
    return [...acc, variantOptionalKey];
  }
  */

  return acc;
};

export { makeVariants };
