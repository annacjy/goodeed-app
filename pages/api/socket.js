const { Server } = require('socket.io');

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io');

    const io = new Server(res.socket.server);

    io.on('connection', socket => {
      console.log('user connected');
      console.log(socket.id + ' ==== connected');

      // socket.on('join', roomName => {
      //   let split = roomName.split('--with--');
      //   let unique = [...new Set(split)].sort((a, b) => (a < b ? -1 : 1));
      //   let updatedRoomName = unique.join('');

      //   socket.join(updatedRoomName);
      //   socket.on('emitMessage', data => {
      //     socket.to(updatedRoomName).emit('onMessage', data);
      //   });
      //   socket.on('isTyping', isTyping => {
      //     socket.broadcast.emit('typing', isTyping);
      //   });
      //   socket.broadcast.emit('isOnline', true);
      // });

      socket.on('emitMessage', data => {
        socket.broadcast.emit('onMessage', data);
      });

      socket.on('disconnect', () => {
        console.log(socket.id + ' ==== diconnected');
        socket.removeAllListeners();
        socket.broadcast.emit('isOnline', false);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }

  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default socketHandler;
