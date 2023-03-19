import fs from "node:fs";
import path from "node:path";

const COMPONENTS_PATH = "src/components";

async function getComponentSpecs() {
  const component_folders = await fs.promises.readdir(
    path.resolve(COMPONENTS_PATH)
  );

  return Promise.all(component_folders.map(_getFileContent));
}

/**
 * @param {string} component_folder
 * @returns {Array}
 */
async function _getFileContent(component_folder) {
  const component_files = await fs.promises.readdir(
    path.resolve(`${COMPONENTS_PATH}/${component_folder}`)
  );

  const effective_file = component_files.find(
    (file) => file === `${component_folder}.tsx`
  );

  const file_content = await fs.promises.readFile(
    path.resolve(`${COMPONENTS_PATH}/${component_folder}/${effective_file}`),
    "utf-8"
  );

  const file_content_splitted = file_content.split("\n");
  const component_and_props = {
    component: effective_file,
    props: [],
  };

  for (let i = 0; i < file_content_splitted.length; i++) {
    if (file_content_splitted[i].includes("interface")) {
      for (let j = i + 1; j < file_content_splitted.length; j++) {
        if (file_content_splitted[j] !== "}") {
          component_and_props.props.push(file_content_splitted[j]);
        } else {
          break;
        }
      }
    }
  }

  return component_and_props;
}

export { COMPONENTS_PATH, getComponentSpecs };
