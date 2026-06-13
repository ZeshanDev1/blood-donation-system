const Admin = require('../models/Admin');

// GET /api/admin/settings/profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ admin: { _id: admin._id, username: admin.username, createdAt: admin.createdAt } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/settings/username
exports.updateUsername = async (req, res) => {
  try {
    const { newUsername, currentPassword } = req.body;

    if (!newUsername || !currentPassword) {
      return res.status(400).json({ error: 'New username and current password are required.' });
    }

    const trimmed = newUsername.trim().toLowerCase();
    if (trimmed.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores.' });
    }

    const admin = await Admin.findById(req.admin.adminId).select('+password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const passwordOk = await admin.comparePassword(currentPassword);
    if (!passwordOk) return res.status(401).json({ error: 'Current password is incorrect.' });

    const taken = await Admin.findOne({ username: trimmed, _id: { $ne: admin._id } });
    if (taken) return res.status(409).json({ error: 'That username is already taken.' });

    admin.username = trimmed;
    await admin.save();

    res.json({ message: 'Username updated successfully.', username: admin.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/settings/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from the current one.' });
    }

    const admin = await Admin.findById(req.admin.adminId).select('+password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const passwordOk = await admin.comparePassword(currentPassword);
    if (!passwordOk) return res.status(401).json({ error: 'Current password is incorrect.' });

    admin.password = newPassword;
    await admin.save(); // pre-save hook hashes the new password

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
