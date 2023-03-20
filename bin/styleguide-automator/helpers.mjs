import fs from "node:fs";
import path from "node:path";

const COMPONENTS_PATH = "src/components";
const STYLEGUIDE_PATH = "src/pages";
const PATH_FROM_STYLEGUIDE_TO_COMPONENTS = path.relative(
  STYLEGUIDE_PATH,
  COMPONENTS_PATH
);
const TYPESCRIPT_INTERFACE = "interface";

/**
 * @param {string} component_folder
 * @returns {Array}
 */
const getFileContent = async (component_folder) => {
  const component_files = await fs.promises.readdir(
    path.resolve(`${COMPONENTS_PATH}/${component_folder}`)
  );

  const effective_file = component_files.find(
    (file) => file === `${component_folder}.tsx`
  );

  const file_content = await fs.promises
    .readFile(
      path.resolve(`${COMPONENTS_PATH}/${component_folder}/${effective_file}`),
      "utf-8"
    )
    .then((content) => content.split("\n"));

  return _makeComponentAndPropsObject(
    component_folder,
    effective_file,
    file_content
  );
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
  const component_and_props = {
    component_name: effective_file.replace(".tsx", ""),
    path: `${PATH_FROM_STYLEGUIDE_TO_COMPONENTS}/${component_folder}/${effective_file}`,
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
 * @param {object} acc
 * @param {string} cur
 * @returns {object}
 */
const _makePropsObject = (acc, cur) => {
  const [key, value] = cur.split(":");
  return { ...acc, [key.trim()]: value.trim() };
};

export {
  COMPONENTS_PATH,
  STYLEGUIDE_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
  getFileContent,
};
