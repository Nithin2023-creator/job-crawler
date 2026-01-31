const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE settings
router.post('/', async (req, res) => {
    const { defaultTags, schedule, userPersona } = req.body;
    try {
        const settings = await Settings.getSettings();

        if (defaultTags) settings.defaultTags = defaultTags;
        if (schedule) settings.schedule = schedule;
        if (userPersona) settings.userPersona = userPersona;

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
