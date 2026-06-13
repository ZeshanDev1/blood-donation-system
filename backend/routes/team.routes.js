const express = require('express');
const TeamMember = require('../models/TeamMember');
const { adminAuth } = require('../middleware/adminAuth');
const { teamUpload } = require('../middleware/upload');
const { toImageUrl: buildImageUrl, removeImage } = require('../utils/imageStore');

const router = express.Router();

const toImageUrl = (file) => buildImageUrl(file, 'team');
const removeFileIfExists = (fileUrl) => removeImage(fileUrl);

// PUBLIC — homepage fetches this
router.get('/public/team', async (req, res) => {
  try {
    const team = await TeamMember.find().sort({ createdAt: 1 });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch team' });
  }
});

// ADMIN — list all
router.get('/admin/team', adminAuth, async (req, res) => {
  try {
    const team = await TeamMember.find().sort({ createdAt: 1 });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch team' });
  }
});

// ADMIN — create (with photo)
router.post('/admin/team', adminAuth, teamUpload.single('image'), async (req, res) => {
  try {
    const { name, title, bio } = req.body;
    if (!name || !title) {
      if (req.file) await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
      return res.status(400).json({ message: 'Name and title are required' });
    }
    const member = await TeamMember.create({
      name,
      title,
      bio,
      imageUrl: req.file ? toImageUrl(req.file) : '',
    });
    res.json({ member });
  } catch (err) {
    if (req.file) await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    res.status(500).json({ message: 'Failed to create team member' });
  }
});

// ADMIN — update (optionally replace photo)
router.patch('/admin/team/:id', adminAuth, teamUpload.single('image'), async (req, res) => {
  try {
    const existing = await TeamMember.findById(req.params.id);
    if (!existing) {
      if (req.file) await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
      return res.status(404).json({ message: 'Member not found' });
    }

    const updates = {
      name: req.body.name ?? existing.name,
      title: req.body.title ?? existing.title,
      bio: req.body.bio ?? existing.bio,
    };

    if (req.file) {
      await removeFileIfExists(existing.imageUrl);
      updates.imageUrl = toImageUrl(req.file);
    }

    const member = await TeamMember.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ member });
  } catch (err) {
    if (req.file) await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    res.status(500).json({ message: 'Failed to update team member' });
  }
});

// ADMIN — delete (and remove photo from disk)
router.delete('/admin/team/:id', adminAuth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    await removeFileIfExists(member.imageUrl);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete team member' });
  }
});

module.exports = router;
