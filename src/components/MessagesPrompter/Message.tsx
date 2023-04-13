import css from "./Message.module.scss";

interface IMessageProps {
  text: string;
}

const Message = ({ text }: IMessageProps) => {
  return <span className={css.message}>{text}</span>;
};

export { Message };
export type { IMessageProps };
