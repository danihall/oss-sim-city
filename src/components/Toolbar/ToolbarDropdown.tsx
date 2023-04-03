import { TOOLBAR_IMG_PATH } from "../../constants";
//import { ToggleEvent } from "../../custom-types";

import css from "./Toolbar.module.scss";
import { ToolInput, IToolInputProps } from "./ToolInput";

interface IToolbarDropdownProps extends IToolInputProps {
  test_1: boolean;
  test_2: "sisi" | "la" | "famille" | "posay" | "courvoisier";
  children_inputs: IToolInputProps[];
}

const ToolbarDropdown = ({
  text,
  img_path,
  children_inputs,
}: IToolbarDropdownProps) => {
  return (
    <details className={css["button-tools-details"]}>
      <summary>
        <img src={TOOLBAR_IMG_PATH + img_path} aria-hidden="true" />
        {text}
      </summary>

      <menu>
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
