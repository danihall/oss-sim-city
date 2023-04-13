import { IMessageProps } from "./Message";
import css from "./Message.module.scss";

interface IMessageAsLinkProps extends IMessageProps {
  to: string;
  is_urgent?: boolean;
  test?: {
    truc: "prout" | "sisi" | "la" | "famille";
  };
}

const MessageAsLink = ({
  text,
  to,
  is_urgent = false,
}: IMessageAsLinkProps) => {
  const className = [css.message, is_urgent ? " " + css.urgent : ""].join("");

  return (
    <a className={className} href={to} title={text}>
      {text}
    </a>
  );
};

export { MessageAsLink };
export type { IMessageAsLinkProps };
