const set = new WeakSet();
const template = (template) => {
  if (set.has(template)) {
    console.log("known template: ", template);
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

const componentTemplate = ({ component, props }) => {
  let props_entries = Object.entries(props);
  console.log(props_entries);

  props_entries = props_entries.length
    ? props_entries
        .flatMap(([key, value]) => `${key}="${value}"`)
        .join(" ")
        .replaceAll(";", "")
    : "";

  return template`
    <div>
        <h2>${component}</h2>
        <div>
            <${
              component[0].toUpperCase() + component.slice(1)
            } ${props_entries}/>
        </div>
    </div>
`;
};

export { componentTemplate };
