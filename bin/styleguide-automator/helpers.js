import fs from "node:fs";
import path from "node:path";

const COMPONENTS_PATH = "src/components";

async function getComponentFiles() {
  const component_folders = await fs.promises.readdir(
    path.resolve(COMPONENTS_PATH)
  );

  return Promise.all(component_folders.map(_getFileContent));
}

async function _getFileContent(component_folder) {
  const component_files = await fs.promises.readdir(
    path.resolve(`${COMPONENTS_PATH}/${component_folder}`)
  );

  const effective_file = component_files.find(
    (file) => file === `${component_folder}.tsx`
  );

  return fs.promises.readFile(
    path.resolve(`${COMPONENTS_PATH}/${component_folder}/${effective_file}`),
    "utf-8"
  );
}

export { COMPONENTS_PATH, getComponentFiles };
