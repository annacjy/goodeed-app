import io from 'socket.io-client';
import gql from 'graphql-tag';
import { useEffect, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';

import Input from 'components/Input';
import Button from 'components/Button';
import ChatBubble from 'components/ChatBubble';
import styles from './styles.module.scss';

const Messages = ({ chatParticipants }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const GET_STORED_MESSAGES = gql`
    query StoredMessages($_id: String!) {
      storedMessages(_id: $_id) {
        messages {
          from
          to
          message
          createdAt
        }
      }
    }
  `;

  const POST_MESSAGE = gql`
    mutation PostMessage($to: BasicUserInfoInput!, $message: String!, $createdAt: String!) {
      postMessage(to: $to, message: $message, createdAt: $createdAt) {
        message
      }
    }
  `;

  const [getStoredMessages, { loading }] = useLazyQuery(GET_STORED_MESSAGES, {
    onCompleted: d => setMessages(d.storedMessages.messages),
  });
  const [postMessage, postMessageRes] = useMutation(POST_MESSAGE);

  useEffect(() => {
    const socketIo = io.connect(process.env.APP_URL, { forceNew: true });

    setSocket(socketIo);

    fetch('/api/socket');

    // when component unmounts, disconnect the socket
    return () => {
      socketIo.disconnect();
    };
  }, []);

  const getData = _id => {
    getStoredMessages({ variables: { _id } });
  };

  useEffect(async () => {
    if (socket && chatParticipants.chatPerson.username) {
      const { user, chatPerson, _id } = chatParticipants;

      if (_id) getData(_id);

      socket.emit('join', `${user}--with--${chatPerson.username}`);
    }
  }, [socket, chatParticipants]);

  useEffect(() => {
    if (socket) {
      socket.on('onMessage', msg => {
        const messageObject = {
          from: chatParticipants.chatPerson.username,
          message: msg,
          createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
        };

        setMessages(prevMessages => {
          const prev = [...prevMessages];
          prev.unshift(messageObject);
          return prev;
        });
      });
    }
  }, [socket]);

  const sendMessage = () => {
    const { user, chatPerson } = chatParticipants;

    const timeStamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    socket.emit(`emitMessage`, message);

    const messageObject = {
      from: user,
      message,
      createdAt: timeStamp,
    };

    setMessages(prevMessages => {
      const prev = [...prevMessages];
      prev.unshift(messageObject);
      return prev;
    });

    const chatUser = { ...chatPerson };

    delete chatUser['__typename'];

    postMessage({ variables: { to: chatUser, message, createdAt: timeStamp } });

    // reset input
    setMessage('');
  };

  return (
    <div>
      {loading ? (
        <div>Loading state</div>
      ) : (
        <div className={styles.chats}>
          {messages.length
            ? messages.map(({ message, from, createdAt }, index) => {
                const position = from === chatParticipants.user ? 'right' : 'left';

                return (
                  <div key={`${index}-${createdAt}`} className={styles[`chats--${position}`]}>
                    <ChatBubble content={message} position={position} timeStamp={createdAt} />
                  </div>
                );
              })
            : 'no messages'}
        </div>
      )}
      <div className={styles.chats__inputMessage}>
        <Input
          name="Message"
          type="text"
          showLabel={false}
          placeholder="Enter your message here"
          value={message}
          onInputChange={val => setMessage(val)}
          onEnter={e => {
            setMessage(e);
            sendMessage();
          }}
        />
        <div className={styles.chats__sendButton}>
          <img src="/send.svg" alt="send message" onClick={sendMessage} />
        </div>
        {/* <Button name="Send" onButtonClick={sendMessage} /> */}
      </div>
    </div>
  );
};

export default Messages;
