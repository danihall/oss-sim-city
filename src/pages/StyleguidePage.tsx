import * as components from "../components/_index";

const StyleguidePage = (): JSX.Element => {
  return (
    <>
      <h1>Styleguide</h1>
      <ol>
        {Object.entries(components).map(([name, component], index) => {
          const Component = component;
          return (
            <li key={index.toString()}>
              <div>{name}</div>
              <Component />
            </li>
          );
        })}
      </ol>
    </>
  );
};

export default StyleguidePage;
