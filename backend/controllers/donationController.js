const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// Calculate next eligible donation date (56 days after donation)
const calculateNextEligibleDate = (donationDate) => {
  const nextDate = new Date(donationDate);
  nextDate.setDate(nextDate.getDate() + 56);
  return nextDate;
};

exports.logDonation = async (req, res) => {
  try {
    const { requestId, units, donationDate, notes } = req.body;

    const nextEligibleDate = calculateNextEligibleDate(new Date(donationDate));

    const donation = new Donation({
      donorId: req.user.userId,
      requestId,
      units,
      donationDate,
      nextEligibleDate,
      notes
    });

    await donation.save();

    // Update donor's last donation date and next eligible date
    await User.findByIdAndUpdate(req.user.userId, {
      lastDonationDate: donationDate,
      nextEligibleDate,
      updatedAt: new Date()
    });

    // Update blood request status if it exists
    if (requestId) {
      await BloodRequest.findByIdAndUpdate(requestId, {
        status: 'fulfilled',
        acceptedDonor: req.user.userId,
        updatedAt: new Date()
      });
    }

    res.status(201).json({
      message: 'Donation logged successfully',
      donation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const { donorId } = req.params;

    const donations = await Donation.find({ donorId })
      .populate('requestId')
      .sort({ donationDate: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonationsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const donations = await Donation.find({ requestId })
      .populate('donorId', 'profile bloodType');

    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    res.json({
      message: 'Donation cancelled',
      donation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
