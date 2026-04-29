const Message = require('../models/Message');
const User = require('../models/User');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
      console.log(`[Socket] Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leaveRoom', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`[Socket] Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, senderId, text } = data;
        
        // Save to DB
        const newMessage = await Message.create({
          roomId,
          sender: senderId,
          text,
        });

        // Populate sender info to send to clients
        await newMessage.populate('sender', 'username');

        // Broadcast to everyone in the room, including sender
        io.to(roomId).emit('newMessage', newMessage);
      } catch (error) {
        console.error('[Socket] Error saving/sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
