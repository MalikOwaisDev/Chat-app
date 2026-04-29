// Placeholder for Socket.io handler (Feature 3)
// Will be wired up in Feature 3

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
