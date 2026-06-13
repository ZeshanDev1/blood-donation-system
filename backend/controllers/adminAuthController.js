const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.json({
      message: 'Login successful',
      token,
      admin: { _id: admin._id, username: admin.username }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
