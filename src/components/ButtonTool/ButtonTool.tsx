import css from "./ButtonTool.module.scss";

interface IButtonToolProps {
  id: number;
  text: string;
  img_path: string;
}

const ButtonTool = ({ id, text, img_path }: IButtonToolProps) => {
  return (
    <button type="button" className={css["button-tool"]} key={id}>
      {text}
      <img src={img_path} aria-hidden="true" />
    </button>
  );
};

export { ButtonTool };
export type { IButtonToolProps };
