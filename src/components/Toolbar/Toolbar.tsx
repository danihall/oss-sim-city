import data from "./data.json";
import css from "./Toolbar.module.scss";
import { ToolbarDropdown, IToolbarDropdownProps } from "./ToolbarDropdown";
import { ToolInput, IToolInputProps } from "./ToolInput";

const Toolbar = () => {
  return (
    <menu className={css["toolbar"]}>
      {data.map((props: IToolInputProps | IToolbarDropdownProps) => {
        if ("children_inputs" in props) {
          return (
            <li key={props.id}>
              <ToolbarDropdown {...props} />
            </li>
          );
        }
        return (
          <li key={props.id}>
            <ToolInput {...props} />
          </li>
        );
      })}
    </menu>
  );
};

export { Toolbar };
