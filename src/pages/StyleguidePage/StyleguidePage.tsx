import components_data from "./componentsToRender.json";

import * as components from "./index";

const StyleguidePage = () => {
  return (
    <>
      <h1>Styleguide</h1>
      <div>
        {Object.entries(components_data).map(
          ([component_name, { props_variants }]) => {
            const Component =
              components[component_name as keyof typeof components];

            if (!props_variants.length) {
              // @ts-expect-error
              return <Component />;
            }

            return props_variants.map((props, index) => {
              const { children, ...props_to_apply } = props;
              return (
                <div key={index.toString()}>
                  <Component {...props_to_apply}>
                    {children ? children : null}
                  </Component>
                </div>
              );
            });
          }
        )}
      </div>
    </>
  );
};

export default StyleguidePage;
