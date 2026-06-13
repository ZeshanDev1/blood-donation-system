const User = require('../models/User');
const Donation = require('../models/Donation');

exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.userId);
    
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json(donor.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDonorProfile = async (req, res) => {
  try {
    const { profile, bloodType, weight, medicalHistory, available } = req.body;

    const donor = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profile,
        bloodType,
        weight,
        medicalHistory,
        available,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: donor.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.userId })
      .populate('requestId')
      .sort({ donationDate: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const donor = await User.findById(req.user.userId);
    
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({
      available: donor.available,
      lastDonationDate: donor.lastDonationDate,
      nextEligibleDate: donor.nextEligibleDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    const donor = await User.findByIdAndUpdate(
      req.user.userId,
      { available, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      message: 'Availability updated',
      available: donor.available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchDonors = async (req, res) => {
  try {
    const { bloodType, city } = req.query;

    if (!bloodType && !city) {
      return res.status(400).json({ error: 'Please provide bloodType or city to search' });
    }

    const query = { role: 'donor', available: true };
    if (bloodType) query.bloodType = bloodType;
    if (city) query['profile.city'] = { $regex: new RegExp(`^${city}`, 'i') };

    const donors = await User.find(query).select('profile bloodType available');

    res.json(donors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
