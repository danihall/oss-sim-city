interface ITextBlockProps {
  children: React.ReactNode;
  fakeProp: string;
}

const TextBlock = ({ children }: ITextBlockProps) => {
  return <p>{children}</p>;
};

export { TextBlock };
