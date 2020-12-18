import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Chat() {
  const [message, setMessage] = useState('');

  // TODO: check how to exectue this on server side as well
  if (process.browser) {
    console.log('client');
  }

  useEffect(() => {
    const socket = io.connect('http://localhost:3000');

    socket.emit('hello', 'hello world its working');

    socket.on('onMessage', msg => setMessage(msg));

    console.log('useeffect triggered?');
  }, []);

  return <div>{message}</div>;
}

// Chat.getInitialProps = async () => {
//   const socket = await io.connect('http://localhost:3000');
//   let message = '';

//   socket.emit('hello', 'hello world its working');

//   socket.on('onMessage', msg => (message = msg));

//   return { message };
// };

export default Chat;
