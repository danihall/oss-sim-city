import { INPUT_RADIO_TOOL } from "../../constants";

import css from "./Toolbar.module.scss";

interface IToolInputProps {
  id: number;
  text: string;
  img_path: string;
}

const ToolInput = ({ id, text, img_path }: IToolInputProps) => {
  return (
    <label className={css["toolbar-tool-input"]}>
      <img src={img_path} aria-hidden="true" />
      <input
        type="radio"
        value={text}
        id={id.toString()}
        name={INPUT_RADIO_TOOL} // all [radio]inputs share the same "name" to keep the "radio" native behavior across the whole toolbar.
      />
      {text}
    </label>
  );
};

export { ToolInput };
export type { IToolInputProps };
