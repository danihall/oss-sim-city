import fs from "node:fs";
import path from "node:path";

import { COMPONENTS_PATH, TSX } from "./getConfig.mjs";

/**
 * @param {string} file
 * @returns {boolean}
 */
const _makeComponentNameandPathObject = (accumulated_files, file) => {
  if (path.extname(file) !== TSX) {
    return accumulated_files;
  }
  const folder_path = accumulated_files[0];

  return [
    ...accumulated_files,
    { component_name: file.replace(TSX, ""), path: `${folder_path}/${file}` },
  ];
};

/**
 * @param {string} component_folder
 * @returns {Promise} array
 */
const getComponentNameAndPath = async (component_folder) => {
  const folder_path = `${COMPONENTS_PATH}/${component_folder}`;
  const files = await fs.promises.readdir(folder_path);
  const effective_files = files.reduce(_makeComponentNameandPathObject, [
    folder_path,
  ]);

  return effective_files.slice(1);
};

export { getComponentNameAndPath };
