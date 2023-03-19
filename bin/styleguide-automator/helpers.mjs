import fs from "node:fs";
import path from "node:path";

const COMPONENTS_PATH = "src/components";
const PAGES_PATH = "src/pages";
const PATH_FROM_PAGES_TO_COMPONENTS = path.relative(
  PAGES_PATH,
  COMPONENTS_PATH
);
const TYPESCRIPT_INTERFACE = "interface";

const getComponentSpecs = async () => {
  const component_folders = await fs.promises.readdir(
    path.resolve(COMPONENTS_PATH)
  );

  return Promise.all(component_folders.map(_getFileContent));
};

/**
 * @param {string} component_folder
 * @returns {Array}
 */
const _getFileContent = async (component_folder) => {
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

  const component_and_props = {
    component: effective_file.replace(".tsx", ""),
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

const _makePropsObject = (acc, cur) => {
  const [key, value] = cur.split(":");
  return { ...acc, [key.trim()]: value.trim() };
};

export {
  COMPONENTS_PATH,
  PAGES_PATH,
  PATH_FROM_PAGES_TO_COMPONENTS,
  getComponentSpecs,
};
