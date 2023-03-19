import { componentTemplate } from "./componentTemplate.mjs";
import {
  COMPONENTS_PATH,
  PAGES_PATH,
  PATH_FROM_PAGES_TO_COMPONENTS,
  getComponentSpecs,
} from "./helpers.mjs";

(async () => {
  const component_specs = await getComponentSpecs();
  const test = componentTemplate(component_specs[0]);
  console.log(test);
})();
