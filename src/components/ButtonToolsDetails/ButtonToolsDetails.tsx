import { ToggleEvent } from "../../custom-types/ToggleEvent";
import { ButtonTool, IButtonToolProps } from "../ButtonTool/ButtonTool";

import css from "./ButtonToolsDetails.module.scss";

interface IButtonToolsDetailsProps extends IButtonToolProps {
  children_button?: IButtonToolProps[];
}

const ButtonToolsDetails = ({
  id,
  text,
  img_path,
  children_button,
}: IButtonToolsDetailsProps) => {
  const handleToggle = (event: ToggleEvent) => {
    console.log(event);
  };

  if (!children_button?.length) {
    return <ButtonTool id={id} text={text} img_path={img_path} />;
  }

  return (
    <details className={css["button-tools-details"]} onToggle={handleToggle}>
      <summary>
        <ButtonTool id={id} text={text} img_path={img_path} />
      </summary>
      <div>
        {children_button.map(({ id, text, img_path }) => {
          return <ButtonTool id={id} text={text} img_path={img_path} />;
        })}
      </div>
    </details>
  );
};

export { ButtonToolsDetails };
