import styles from './styles.module.scss';

const ChatBubble = ({ content, timeStamp }) => {
  return (
    <div className={styles.chatBubble}>
      <p>{content}</p>
      <span>{timeStamp}</span>
    </div>
  );
};

export default ChatBubble;
