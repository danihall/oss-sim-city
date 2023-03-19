const template = (chunks, ...rest) => {
  return (
    chunks[0] + rest[0] + chunks[1] + rest[1] + chunks[2] + rest[2] + chunks[3]
  );
};

const componentTemplate = ({ component, props }) => {
  let props_entries = Object.entries(props);

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
