import fs from "node:fs";
import path from "node:path";

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
 * @param {string} file
 * @param {array} content_as_array
 * @param {string} component_folder
 * @returns {object}
 */
const _makeComponentAndPropsObject = (
  file,
  content_as_array,
  component_folder
) => {
  const name = file.split("/").pop().replace(".tsx", "");
  const component_and_props = {
    component_name: name,
    path: `${PATH_FROM_STYLEGUIDE_TO_COMPONENTS}/${component_folder}/${name}`,
    props: {},
  };
  const _props = [];

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    if (content_as_array[i].includes(TYPESCRIPT_INTERFACE)) {
      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] !== "}") {
          _props.push(content_as_array[j]);
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
 * @param {string} file
 * @this {object} component_folder
 * @returns {Promise}
 */
const _getFileContent = async function (file) {
  const content = await fs.promises.readFile(file, "utf-8");
  const content_as_array = content.split("\n");

  return _makeComponentAndPropsObject(
    file,
    content_as_array,
    this.component_folder
  );
  /*
  return fs.promises
    .readFile(file, "utf-8")
    .then((content) => content.split("\n"))
    .then((content_as_array) =>
      _makeComponentAndPropsObject(
        file,
        content_as_array,
        this.component_folder
      )
    )
    .catch((reason) => console.error(reason));
    */
};

/**
 * @param {string} component_folder
 * @returns {Array}
 */
const getComponentSpecs = async (component_folder) => {
  const component_files = await fs.promises.readdir(
    `${COMPONENTS_PATH}/${component_folder}`
  );

  const effective_files = component_files
    .filter((file) => path.extname(file) === ".tsx")
    .map((tsx_file) => `${COMPONENTS_PATH}/${component_folder}/${tsx_file}`);

  /*
  const files_content = await Promise.all(
    effective_files.map(_getFileContent, { component_folder })
  );
  */

  return Promise.all(
    effective_files.map(_getFileContent, { component_folder })
  );

  //return Promise.all(files_content.map(_makeComponentAndPropsObject, {}));

  /*
  return _makeComponentAndPropsObject(
    component_folder,
    effective_files,
    file_content
  );
  */
};

export { getComponentSpecs };
