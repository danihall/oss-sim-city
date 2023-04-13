import { IMessageProps, Message } from "./Message";
import { IMessageAsLinkProps, MessageAsLink } from "./MessageAsLink";
import css from "./MessagesPrompter.module.scss";

interface IMessagesPrompterProps {
  messages: (IMessageProps | IMessageAsLinkProps)[];
}

const MessagesPrompter = ({ messages }: IMessagesPrompterProps) => {
  return (
    <div>
      {messages.map((message_props) => {
        return "to" in message_props ? (
          <MessageAsLink {...message_props} />
        ) : (
          <Message {...message_props} />
        );
      })}
    </div>
  );
};

export { MessagesPrompter };
