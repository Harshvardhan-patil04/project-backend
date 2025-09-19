const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Note = require('../models/Note');

// Middleware to check if admin
const adminCheck = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || (user.role !== 'admin' && user.email !== 'admin@example.com')) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Get all users
router.get('/users', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all notes
router.get('/notes', auth, adminCheck, async (req, res) => {
  try {
    const notes = await Note.find().populate('user', 'name email');
    res.json(notes);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete user
router.delete('/user/:id', auth, adminCheck, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Note.deleteMany({ user: req.params.id });
    res.json({ message: 'User and their notes deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete note
router.delete('/note/:id', auth, adminCheck, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
