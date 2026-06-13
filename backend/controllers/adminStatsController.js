const Donor = require('../models/Donor');
const Request = require('../models/Request');

exports.getStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const fulfilledRequests = await Request.countDocuments({ status: 'fulfilled' });

    const bloodGroupCounts = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalDonors,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      bloodGroupCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
