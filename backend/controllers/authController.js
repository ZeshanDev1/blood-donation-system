const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { email, password, role, profile, bloodType, weight, hospitalName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Require password for donors (they should sign up with a password)
    if (role === 'donor' && !password) {
      return res.status(400).json({ error: 'Please provide a password for donor registration' });
    }

    const pwd = password;

    // Create new user
    user = new User({
      email,
      password: pwd,
      role,
      profile,
      bloodType: role === 'donor' ? bloodType : undefined,
      weight: role === 'donor' ? weight : undefined,
      hospitalName: role === 'patient' ? hospitalName : undefined
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  // JWT is stateless, so logout is handled on the client side
  res.json({ message: 'Logged out successfully' });
};
 
