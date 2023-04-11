import css from "./Message.module.scss";

interface IMessageProps {
  link?: {
    to: string;
    is_urgent: boolean;
    infos: {
      list: string[];
    };
  };
  text: string;
}

const Message = ({ link, text }: IMessageProps) => {
  return link ? (
    <a href={link.to} title={text}>
      {text}
    </a>
  ) : (
    <span>{text}</span>
  );
};

export { Message };
export type { IMessageProps };
