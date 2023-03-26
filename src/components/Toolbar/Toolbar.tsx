import data from "./data.json";
import { ToolbarDropdown, IToolbarDropdownProps } from "./ToolbarDropdown";
import { ToolInput, IToolInputProps } from "./ToolInput";

const Toolbar = () => {
  return (
    <menu>
      {data.map((entry: IToolInputProps | IToolbarDropdownProps) => {
        if ("children_inputs" in entry) {
          return (
            <li key={entry.id}>
              <ToolbarDropdown
                id={entry.id}
                text={entry.text}
                img_path={entry.img_path}
                children_inputs={entry.children_inputs}
                access_key={entry.access_key}
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
