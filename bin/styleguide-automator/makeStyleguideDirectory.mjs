import fs from "node:fs";

import { STYLEGUIDE_PATH } from "./getConfig.mjs";

/**
 * @returns {Promise}
 */
const createStyleguideDirectory = () => {
  return fs.promises
    .mkdir(STYLEGUIDE_PATH)
    .catch((error) =>
      error.code === "EEXIST"
        ? Promise.resolve(error.path)
        : Promise.reject(error)
    );
};

export { createStyleguideDirectory };
