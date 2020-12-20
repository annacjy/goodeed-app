import { useEffect, useState } from 'react';
import io from 'socket.io-client';

import NoSsr from 'components/NoSsr';
import Input from 'components/Input';
import Button from 'components/Button';
import ChatBubble from 'components/ChatBubble';

function Chat() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [received, setReceived] = useState('');

  useEffect(() => {
    const socketIo = io.connect('http://localhost:3000');

    setSocket(socketIo);

    function cleanup() {
      socketIo.disconnect();
    }
    return cleanup;

    // should only run once and not on every re-render,
    // so pass an empty array
  }, []);

  useEffect(async () => {
    await fetch('/api/socket');
    // socket.on('join', 'a&b');
    if (socket) {
      socket.on('onMessage', msg => setReceived(msg));
    }

    console.log('useeffect triggered');
  }, [socket]);

  const sendMessage = () => {
    socket.emit('emitMessage', message);
  };

  return (
    <NoSsr>
      <ChatBubble content={received} />
      <Input name="Message" type="text" onInputChange={val => setMessage(val)} />
      <Button name="Send" onButtonClick={sendMessage} />
    </NoSsr>
  );
}

export default Chat;
