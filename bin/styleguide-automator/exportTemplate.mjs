/**
 * @param {TemplateStringsArray} template
 * @param  {Array} rest
 * @returns {string}
 */
const _template = (template, ...rest) => {
  return template.map((part, index) => part + (rest[index] ?? "")).join("");
};

/**
 * @param {string} params.component_name
 * @param {string} params.path
 * @returns {string}
 */
const createExportStatement = ({ component_name, path }) =>
  _template`export {${component_name}} from "${path}";`;

export { createExportStatement };
