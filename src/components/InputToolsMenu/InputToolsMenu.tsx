import { ToggleEvent } from "../../custom-types/ToggleEvent";
import { InputTool, IInputToolProps } from "../InputTool/InputTool";

import css from "./InputToolsMenu.module.scss";

interface IInputToolsMenuProps extends IInputToolProps {
  children_button?: IInputToolProps[];
}

const InputToolsMenu = ({
  id,
  text,
  img_path,
  children_button,
}: IInputToolsMenuProps) => {
  const handleToggle = (event: ToggleEvent) => {
    console.log(event);
  };

  if (!children_button?.length) {
    return <InputTool id={id} text={text} img_path={img_path} />;
  }

  return (
    <details className={css["button-tools-details"]} onToggle={handleToggle}>
      <summary role="button" aria-haspopup="menu">
        <InputTool is_button_type id={id} text={text} img_path={img_path} />
      </summary>
      <menu role="menu">
        {children_button.map(({ id, text, img_path }) => {
          return (
            <li key={id}>
              <InputTool id={id} text={text} img_path={img_path} />
            </li>
          );
        })}
      </menu>
    </details>
  );
};

export { InputToolsMenu };
