import { ToggleEvent } from "../../custom-types/ToggleEvent";

import css from "./Toolbar.module.scss";
import { ToolbarDropdownButton } from "./ToolbarDropdownButton";
import { ToolInput, IToolInputProps } from "./ToolInput";

interface IToolbarDropdownProps extends IToolInputProps {
  children_inputs: IToolInputProps[];
  access_key: string;
}

const ToolbarDropdown = ({
  id,
  text,
  img_path,
  children_inputs,
  access_key,
}: IToolbarDropdownProps) => {
  const handleToggle = (event: ToggleEvent) => {
    console.log(event);
  };

  return (
    <details className={css["button-tools-details"]} onToggle={handleToggle}>
      <summary role="button" aria-haspopup="menu">
        <ToolbarDropdownButton
          id={id}
          text={text}
          img_path={img_path}
          access_key={access_key}
        />
      </summary>

      <menu role="menu">
        {children_inputs.map(({ id, text, img_path }) => {
          return (
            <li key={id}>
              <ToolInput id={id} text={text} img_path={img_path} />
            </li>
          );
        })}
      </menu>
    </details>
  );
};

export { ToolbarDropdown };
export type { IToolbarDropdownProps };
