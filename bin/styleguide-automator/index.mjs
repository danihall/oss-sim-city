import fs from "node:fs";

import { createExportStatement } from "./exportTemplate.mjs";
import { getFileContent } from "./helpers.mjs";
import {
  COMPONENTS_PATH,
  STYLEGUIDE_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
import { PROP_TYPES_MAP } from "./propTypesMap.mjs";

(async () => {
  const component_folders = await fs.promises.readdir(COMPONENTS_PATH);

  const component_specs = await Promise.all(
    component_folders.map(getFileContent)
  );

  const components_export_statements = component_specs
    .map((component) => createExportStatement(component))
    .join("");

  const components_render_specs = Object.fromEntries(
    Object.entries({ ...component_specs }).map(transformComponentSpecs)
  );
})();

const transformComponentSpecs = (entry) => {
  const [, { component_name, props }] = entry;
  const propsAsArray = Object.entries(props);

  const fake_props = [Object.fromEntries(propsAsArray.map(makeFakeProps))];

  const optional_props = Object.keys(fake_props[0]).filter(getOptionalKey);
  if (optional_props.length) {
    optional_props.forEach(addPropsVariantConfig, { fake_props, propsAsArray });
  }

  return [component_name, { props: fake_props }];
};

const makeFakeProps = ([prop_name, type]) => [prop_name, PROP_TYPES_MAP[type]];

const getOptionalKey = (prop_key) => prop_key.includes("?");

const addPropsVariantConfig = function (optional_prop) {
  this.fake_props.push(
    Object.fromEntries(
      this.propsAsArray
        .filter(isNotOptionalProp, { optional_prop })
        .map(makeFakeProps)
    )
  );
};

const isNotOptionalProp = function ([prop_name]) {
  return prop_name !== this.optional_prop;
};
