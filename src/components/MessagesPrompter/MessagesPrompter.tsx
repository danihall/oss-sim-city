import { IMessageProps, Message } from "./Message";
import css from "./MessagesPrompter.module.scss";

interface IMessagesPrompterProps {
  messages: IMessageProps[];
}

const MessagesPrompter = ({ messages }: IMessagesPrompterProps) => {
  return (
    <div>
      {messages.map(({ link, text }) => {
        return <Message link={link} text={text} />;
      })}
    </div>
  );
};

export { MessagesPrompter };
