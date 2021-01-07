const { Server } = require('socket.io');

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on('connection', socket => {
      socket.on('join', roomName => {
        let split = roomName.split('--with--');
        let unique = [...new Set(split)].sort((a, b) => (a < b ? -1 : 1));
        let updatedRoomName = `${unique[0]}--with--${unique[1]}`;

        Array.from(socket.rooms)
          .filter(it => it !== socket.id)
          .forEach(id => {
            socket.leave(id);
            socket.removeAllListeners(`emitMessage`);
          });

        socket.join(updatedRoomName);

        socket.on(`emitMessage`, message => {
          Array.from(socket.rooms)
            .filter(it => it !== socket.id)
            .forEach(id => {
              socket.to(id).emit('onMessage', message);
            });
        });
      });

      socket.on('disconnect', () => {
        socket.removeAllListeners();
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default socketHandler;
