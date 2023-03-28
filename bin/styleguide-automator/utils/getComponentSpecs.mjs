import fs from "node:fs";
import path from "node:path";

import {
  COMPONENTS_PATH,
  PATH_FROM_STYLEGUIDE_TO_COMPONENTS,
} from "./paths.mjs";
import { SOURCE_OF_TRUTH } from "./sourceOfTruth.mjs";

const SOURCE_OF_TRUTH_keys = Object.keys(SOURCE_OF_TRUTH);
const REGEX_INTERFACE = /(?<=interface\s)([A-Za-z]|\s(?!{))+/;

/**
 * @param {object} acc
 * @param {string} cur
 * @returns {object}
 */
const _makePropsObject = (acc, cur) => {
  const [key, value] = cur.split(":");
  const sanitized_key = key.replace("?", "").trim();
  const sanitized_value = value.replace(";", "").trim();

  if (Array.isArray(acc)) {
    return [...acc, [sanitized_key, sanitized_value]];
  }

  return {
    ...acc,
    [sanitized_key]: sanitized_value,
  };
};

/**
 * @param {string} file
 * @param {array} content_as_array
 * @param {string} component_folder
 * @returns {object}
 */
const _makeComponentAndPropsDataObject = (
  file,
  content_as_array,
  component_folder
) => {
  const name = file.split("/").pop().replace(".tsx", "");
  const component_and_props = {
    component_name: name,
    path: `${PATH_FROM_STYLEGUIDE_TO_COMPONENTS}/${component_folder}/${name}`,
    interface_name: null,
    interface_extended_from: null,
    props: {},
  };
  //const _props = [];

  parent_loop: for (let i = 0; i < content_as_array.length; i++) {
    const interface_name = content_as_array[i]
      .match(REGEX_INTERFACE)?.[0]
      .split(" extends ");

    if (interface_name) {
      component_and_props.interface_name = interface_name[0];
      component_and_props.interface_extended_from = interface_name[1];

      for (let j = i + 1; j < content_as_array.length; j++) {
        if (content_as_array[j] !== "}") {
          //_props.push(content_as_array[j]);
          let [key, value] = content_as_array[j].split(":");

          key = key.replace("?", "").trim();
          value = value.replace(";", "").trim();

          component_and_props.props[key] = value;
        } else {
          break parent_loop;
        }
      }
    }
  }

  /*
  if (_props.length) {
    component_and_props.props = _props.reduce(_makePropsObject, {});
  }
  */

  return component_and_props;
};

/**
 * @param {string} file
 * @this {object} component_folder
 * @returns {Promise}
 */
const _updateSourceOfTruth = async function (file) {
  const content = await fs.promises.readFile(file, "utf-8");
  const content_as_array = content.split("\n");

  return _makeComponentAndPropsDataObject(
    file,
    content_as_array,
    this.component_folder
  );
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

  return Promise.all(
    effective_files.map(_updateSourceOfTruth, { component_folder })
  );
};

export { getComponentSpecs };
