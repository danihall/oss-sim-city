import fs from "node:fs";

import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
const TYPESCRIPT_INTERFACE = "interface";

/**
 * @param {object} acc
 * @param {string} cur
 * @returns {object}
 */
const _makePropsObject = (acc, cur) => {
  const [key, value] = cur.split(":");
  return {
    ...acc,
    [key.replace("?", "").trim()]: value.replace(";", "").trim(),
  };
};

/**
 * @param {string} component_folder
 * @param {string} effective_file
 * @param {string} file_content
 * @returns {object}
 */
const _makeComponentAndPropsObject = (
  component_folder,
  effective_file,
  file_content
) => {
  const name = effective_file.replace(".tsx", "");
  const component_and_props = {
    component_name: name,
    path: `${PATH_FROM_STYLEGUIDE_TO_COMPONENTS}/${component_folder}/${name}`,
    props: {},
  };
  const _props = [];

  parent_loop: for (let i = 0; i < file_content.length; i++) {
    if (file_content[i].includes(TYPESCRIPT_INTERFACE)) {
      for (let j = i + 1; j < file_content.length; j++) {
        if (file_content[j] !== "}") {
          _props.push(file_content[j]);
        } else {
          break parent_loop;
        }
      }
    }
  }

  if (_props.length) {
    component_and_props.props = _props.reduce(_makePropsObject, {});
  }

  return component_and_props;
};

/**
 * @param {string} component_folder
 * @returns {Array}
 */
const getFileContent = async (component_folder) => {
  const component_files = await fs.promises.readdir(
    `${COMPONENTS_PATH}/${component_folder}`
  );

  const effective_file = component_files.find(
    (file) => file === `${component_folder}.tsx`
  );

  const file_content = await fs.promises
    .readFile(
      `${COMPONENTS_PATH}/${component_folder}/${effective_file}`,
      "utf-8"
    )
    .then((content) => content.split("\n"));

  return _makeComponentAndPropsObject(
    component_folder,
    effective_file,
    file_content
  );
};

export { getFileContent };
