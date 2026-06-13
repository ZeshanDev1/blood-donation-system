const Donor = require('../models/Donor');

exports.listDonors = async (req, res) => {
  try {
    const { q, bloodGroup, city, availability } = req.query;
    const query = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(`^${city}`, 'i');
    if (availability) query.availability = availability;

    const donors = await Donor.find(query).sort({ createdAt: -1 });

    res.json({ donors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    await Donor.findByIdAndDelete(id);
    res.json({ message: 'Donor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const availableDonors = await Donor.countDocuments({ availability: 'available' });

    const groupCounts = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ totalDonors, availableDonors, groupCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonorHistory = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({ history: donor.donationHistory || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addDonorHistory = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    const { recipientName, bloodGroup, donationDate, hospitalName, requestId, notes } = req.body;

    if (!recipientName || !bloodGroup || !donationDate || !hospitalName) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    donor.donationHistory.push({
      recipientName,
      bloodGroup,
      donationDate: new Date(donationDate),
      hospitalName,
      requestId,
      notes
    });

    donor.lastDonationDate = new Date(donationDate);
    await donor.save();

    res.json({ message: 'Donation history updated', donor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
