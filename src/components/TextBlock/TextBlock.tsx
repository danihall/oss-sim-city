interface ITextBlockProps {
  children: React.ReactNode;
}

const TextBlock = ({ children }: ITextBlockProps) => {
  return <p>{children}</p>;
};

export { TextBlock };
