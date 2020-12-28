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
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const GET_STORED_MESSAGES = gql`
    query StoredMessages($_id: String!) {
      storedMessages(_id: $_id) {
        participants
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
    mutation PostMessage($to: String!, $message: String!, $createdAt: String!) {
      postMessage(to: $to, message: $message, createdAt: $createdAt) {
        message
      }
    }
  `;

  const [getStoredMessages, { loading }] = useLazyQuery(GET_STORED_MESSAGES, {
    fetchPolicy: 'network-only',
    onCompleted: d => setMessages(d.storedMessages.messages),
  });
  const [postMessage, postMessageRes] = useMutation(POST_MESSAGE);

  useEffect(async () => {
    const socketIo = io.connect(process.env.APP_URL, { forceNew: true });

    setSocket(socketIo);

    await fetch('/api/socket');
    function cleanup() {
      socketIo.disconnect();
    }
    return cleanup;
  }, []);

  const getData = _id => {
    getStoredMessages({ variables: { _id } });
  };

  useEffect(async () => {
    if (socket && chatParticipants) {
      const { user, chatPerson, _id } = chatParticipants;

      getData(_id);

      socket.emit('join', `${user}--with--${chatPerson}`);

      socket.on('roomName', roomName => setRoom(roomName));
    }
  }, [socket, chatParticipants]);

  useEffect(() => {
    if (socket) {
      socket.on('onMessage', msg => {
        console.log('message?', msg);
        const messageObject = {
          from: chatParticipants.chatPerson,
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

    postMessage({ variables: { from: user, to: chatPerson, message, createdAt: timeStamp } });
  };

  return (
    <div>
      <div className={styles.chats}>
        {messages.length
          ? messages.map(({ message, from, createdAt }) => {
              const position = from === chatParticipants.user ? 'right' : 'left';

              return (
                <div className={styles[`chats--${position}`]}>
                  <ChatBubble content={message} position={position} timeStamp={createdAt} />
                </div>
              );
            })
          : 'no messages'}
      </div>
      <div>
        <Input name="Message" type="text" onInputChange={val => setMessage(val)} />
        <Button name="Send" onButtonClick={sendMessage} />
      </div>
    </div>
  );
};

export default Messages;
