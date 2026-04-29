const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Message = require('../models/Message');

router.use(verifyToken);

// GET messages for a specific room
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 }); // Oldest to newest
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;
