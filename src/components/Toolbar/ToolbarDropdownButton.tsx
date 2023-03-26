import css from "./Toolbar.module.scss";
import { IToolInputProps } from "./ToolInput";

interface IToolbarDropdownButtonProps extends IToolInputProps {
  access_key: string;
}

const ToolbarDropdownButton = ({
  id,
  text,
  img_path,
  access_key,
}: IToolbarDropdownButtonProps) => {
  return (
    <button
      className={css["toolbar-dropdown-button"]}
      accessKey={access_key ? access_key : void 0}
      id={id.toString()}
    >
      <img src={img_path} aria-hidden="true" />
      {text}
    </button>
  );
};

export { ToolbarDropdownButton };
