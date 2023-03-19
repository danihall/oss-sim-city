//console.log(components.TextBlock({ content: "prout" }));
import { Nav } from "../components/Nav/Nav";
import { TextBlock } from "../components/TextBlock/TextBlock";

const StyleguidePage = () => {
  return (
    <>
      <h1>Styleguide</h1>
      <div>
        <ul>
          <li>
            <Nav />
          </li>
          <li>
            <TextBlock>coucou sim city</TextBlock>
          </li>
        </ul>
      </div>
    </>
  );
};

export default StyleguidePage;
