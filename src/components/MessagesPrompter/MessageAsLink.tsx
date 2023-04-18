import { IMessageProps } from "./Message";
import css from "./Message.module.scss";

interface IMessageAsLinkProps extends IMessageProps {
  to: string;
  dummy_list: number[];
  test?: {
    truc: "prout" | "sisi" | "la" | "famille";
    chiffre: 2;
    deep?: {
      deep_key: boolean;
      arr: "sisi"[];
      deeper?: {
        hell: boolean;
      };
    };
    interstice: string;
  };
  wesh: 1 | "deux" | boolean | string;
  machin: number;
  is_urgent?: boolean;
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
