import styles from './styles.module.scss';

const ChatBubble = ({ content, timeStamp, position }) => {
  return (
    <div className={`${styles.chatBubble} ${styles[`chatBubble--${position}`]}`}>
      <p>{content}</p>
      <span>{timeStamp}</span>
    </div>
  );
};

export default ChatBubble;
