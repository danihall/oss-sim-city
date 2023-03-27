import data from "./data.json";
import css from "./Toolbar.module.scss";
import { ToolbarDropdown, IToolbarDropdownProps } from "./ToolbarDropdown";
import { ToolInput, IToolInputProps } from "./ToolInput";

const Toolbar = () => {
  return (
    <menu className={css["toolbar"]}>
      {data.map((entry: IToolInputProps | IToolbarDropdownProps) => {
        if ("children_inputs" in entry) {
          return (
            <li key={entry.id}>
              <ToolbarDropdown
                id={entry.id}
                text={entry.text}
                img_path={entry.img_path}
                children_inputs={entry.children_inputs}
              />
            </li>
          );
        }
        return (
          <li key={entry.id}>
            <ToolInput
              id={entry.id}
              text={entry.text}
              img_path={entry.img_path}
            />
          </li>
        );
      })}
    </menu>
  );
};

export { Toolbar };
