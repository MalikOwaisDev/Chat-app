const Message = require('../models/Message');
const User = require('../models/User');

const roomUsers = {}; // Structure: { roomId: [{ socketId, username }] }
const globalUsers = {}; // Structure: { username: socketId }

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('globalJoin', ({ username, userId }) => {
      globalUsers[username] = socket.id;
      if (userId) socket.join(userId); // Join a personal room for notifications
      io.emit('globalUsersUpdate', Object.keys(globalUsers));
      console.log(`[Socket] Global user connected: ${username}`);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
      socket.join(roomId);
      
      // Add user to roomUsers tracking
      if (!roomUsers[roomId]) roomUsers[roomId] = [];
      const userIndex = roomUsers[roomId].findIndex(u => u.username === username);
      if (userIndex === -1) {
        roomUsers[roomId].push({ socketId: socket.id, username });
      } else {
        roomUsers[roomId][userIndex].socketId = socket.id; // update socket id if reconnected
      }

      // Emit updated user list to everyone in room
      io.to(roomId).emit('roomUsers', roomUsers[roomId].map(u => u.username));
      
      console.log(`[Socket] ${username} joined room: ${roomId}`);
    });

    socket.on('leaveRoom', ({ roomId, username }) => {
      socket.leave(roomId);
      
      // Remove user from tracking
      if (roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit('roomUsers', roomUsers[roomId].map(u => u.username));
      }
      
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

        // Feature 7: Notifications
        const room = require('mongoose').model('Room');
        const currentRoom = await room.findById(roomId);
        if (currentRoom) {
          currentRoom.members.forEach(memberId => {
            if (memberId.toString() !== senderId) {
              // Emit notification to user's personal room
              io.to(memberId.toString()).emit('newNotification', {
                roomId,
                roomName: currentRoom.name,
                senderName: newMessage.sender.username,
                text,
              });
            }
          });
        }
      } catch (error) {
        console.error('[Socket] Error saving/sending message:', error);
      }
    });

    socket.on('typing', ({ roomId, username }) => {
      socket.to(roomId).emit('userTyping', { username });
    });

    socket.on('stopTyping', ({ roomId, username }) => {
      socket.to(roomId).emit('userStoppedTyping', { username });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      
      // Remove from global users
      let disconnectedUser = null;
      for (const username in globalUsers) {
        if (globalUsers[username] === socket.id) {
          disconnectedUser = username;
          delete globalUsers[username];
          break;
        }
      }
      
      if (disconnectedUser) {
        io.emit('globalUsersUpdate', Object.keys(globalUsers));
      }

      // Find which room this socket was in and remove them
      for (const roomId in roomUsers) {
        const initialLength = roomUsers[roomId].length;
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        if (roomUsers[roomId].length < initialLength) {
          io.to(roomId).emit('roomUsers', roomUsers[roomId].map(u => u.username));
        }
      }
    });
  });
};

module.exports = socketHandler;
