const set = new WeakSet();
const template = (template, ...rest) => {
  if (set.has(template)) {
    console.log("known template: ", template, template.length, rest);
  } else {
    set.add(template);
    console.log("new template");
  }
  /*
  return (
    chunks[0] + rest[0] + chunks[1] + rest[1] + chunks[2] + rest[2] + chunks[3]
  );
  */
};

const importTemplate = ({ component_name, props }) => {
  return template`import`;
};

export { importTemplate };
