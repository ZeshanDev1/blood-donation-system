const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.admin = { adminId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { adminAuth };
