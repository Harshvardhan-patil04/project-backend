const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Note = require('../models/Note');

// Add new note
router.post('/', auth, async (req, res) => {
    const { title, description } = req.body;
    try {
        const note = new Note({ user: req.user.id, title, description });
        await note.save();
        res.json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all notes
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update note
router.put('/:id', auth, async (req, res) => {
    const { title, description } = req.body;
    try {
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        note.title = title || note.title;
        note.description = description || note.description;

        await note.save();
        res.json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        await note.remove();
        res.json({ message: 'Note removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
