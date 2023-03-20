import fs from "node:fs";
import path from "node:path";

import {
  COMPONENTS_PATH,
  STYLEGUIDE_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
  getFileContent,
} from "./helpers.mjs";
import { importTemplate } from "./importTemplate.mjs";

(async () => {
  const component_folders = await fs.promises.readdir(
    path.resolve(COMPONENTS_PATH)
  );

  const component_specs = await Promise.all(
    component_folders.map(getFileContent)
  );
  console.log(component_specs);
})();
