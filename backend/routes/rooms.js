const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Room = require('../models/Room');

// Protect all room routes
router.use(verifyToken);

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// POST create a new room
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const existingRoom = await Room.findOne({ name: name.trim() });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const newRoom = new Room({
      name: name.trim(),
      createdBy: req.user.id,
      members: [req.user.id],
    });

    const savedRoom = await newRoom.save();
    
    // Populate createdBy before sending response
    await savedRoom.populate('createdBy', 'username');

    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
});

module.exports = router;
