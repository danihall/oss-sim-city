interface ITextBlockProps {
  children: React.ReactNode;
  fake_Prop?: string;
}

const TextBlock = ({ children }: ITextBlockProps) => {
  return <p>{children}</p>;
};

export { TextBlock };
