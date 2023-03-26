import { INPUT_RADIO_TOOL } from "../../constants";

import css from "./InputTool.module.scss";

interface IInputToolProps {
  is_button_type?: boolean;
  access_key?: string;
  id: number;
  text: string;
  img_path: string;
}

const InputTool = ({
  id,
  is_button_type = false,
  access_key = "",
  text,
  img_path,
}: IInputToolProps) => {
  const input_props_to_apply = {
    type: is_button_type ? "button" : "radio",
    value: text,
    id: id.toString(),
    ...(!is_button_type && {
      name: INPUT_RADIO_TOOL, // all [radio]inputs share the same "name" to keep the "radio" behavior across the whole tools-menu.
    }),
    ...(is_button_type &&
      access_key && {
        accessKey: access_key,
      }),
  };

  return (
    <label className={css["input-tool"]}>
      <img src={img_path} aria-hidden="true" />
      <input {...input_props_to_apply} />
      {text}
    </label>
  );
};

export { InputTool };
export type { IInputToolProps };
