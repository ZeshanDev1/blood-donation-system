const User = require('../models/User');

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.userId);
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const { profile, hospitalName } = req.body;

    const patient = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profile,
        hospitalName,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: patient.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
