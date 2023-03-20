import components_data from "./data.json";

import * as components from "./index";

const StyleguidePage = () => {
  return (
    <>
      <h1>Styleguide</h1>
      <div>
        {components_data.map(({ component_name, props }) => {
          const Component = components[component_name];
          return (
            <Component {...props}>
              {props.children ? props.children : null}
            </Component>
          );
        })}
      </div>
    </>
  );
};

export default StyleguidePage;
