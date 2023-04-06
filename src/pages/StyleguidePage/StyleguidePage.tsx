import components_data from "./componentsToRender.json";

import * as components from "./index";

type TComponent = keyof typeof components;

const StyleguidePage = () => {
  return (
    <>
      <h1>Styleguide</h1>
      <div>
        {Object.entries(components_data).map(
          ([component_name, { fake_props }]) => {
            const Component = components[component_name as TComponent];

            return (
              <>
                <h2>{component_name}</h2>
                {fake_props?.map((props: object, index: number) => {
                  const { children, ...props_to_apply } = props as any;
                  return (
                    <div key={index.toString()}>
                      <Component {...props_to_apply}>
                        {children ? children : null}
                      </Component>
                    </div>
                  );
                })}
              </>
            );
          }
        )}
      </div>
    </>
  );
};

export default StyleguidePage;
