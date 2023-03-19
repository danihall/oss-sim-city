import { Not } from "../../custom-types";

interface ITextBlockProps {
  children: Not<null | undefined | boolean, React.ReactNode>;
}

const TextBlock = ({ children }: ITextBlockProps) => {
  return <p>{children}</p>;
};

export { TextBlock };
export type { ITextBlockProps };
