import { COMPONENTS_PATH, getComponentFiles } from "./helpers.js";

(async () => {
  const component_files = await getComponentFiles();
  console.log(component_files);
})();
