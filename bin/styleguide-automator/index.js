import { COMPONENTS_PATH, getComponentSpecs } from "./helpers.js";

(async () => {
  const component_specs = await getComponentSpecs();
  const test = JSON.parse(
    `{${component_specs[1].props
      .join("")
      .trim()
      .replaceAll(";", ",")
      .slice(0, -1)}}`
  );
  console.log(test);
})();
