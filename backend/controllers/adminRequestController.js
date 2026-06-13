const Request = require('../models/Request');
const Donor = require('../models/Donor');

exports.listRequests = async (req, res) => {
  try {
    const { q, status, bloodGroup, city } = req.query;
    const query = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ recipientName: regex }, { contactNumber: regex }];
    }

    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(`^${city}`, 'i');

    const requests = await Request.find(query)
      .populate('assignedDonor', 'fullName phone bloodGroup city area');

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { status, assignedDonor } = req.body;

    // load existing request to determine previous assigned donor if any
    const existingRequest = await Request.findById(req.params.id);
    if (!existingRequest) return res.status(404).json({ error: 'Request not found' });

    const update = { updatedAt: new Date() };
    if (status) {
      update.status = status;
      if (status === 'fulfilled') {
        update.fulfilledAt = new Date();
      }
    }
    if (assignedDonor) update.assignedDonor = assignedDonor;

    const request = await Request.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignedDonor', 'fullName phone bloodGroup city area');

    // If the request was just marked fulfilled, add an entry to the donor's donationHistory
    if (status === 'fulfilled') {
      // Prefer the assignedDonor from the update payload, otherwise use existing assignedDonor
      const donorId = assignedDonor || (existingRequest.assignedDonor ? existingRequest.assignedDonor.toString() : null);
      if (donorId) {
        const donor = await Donor.findById(donorId);
        if (donor) {
          // avoid duplicate entries for the same request
          const alreadyRecorded = donor.donationHistory && donor.donationHistory.find(h => h.requestId && h.requestId.toString() === request._id.toString());
          if (!alreadyRecorded) {
              // Only store non-identifying details in donor history (no recipient contact/name)
              const historyEntry = {
                bloodGroup: request.bloodGroup || existingRequest.bloodGroup,
                donationDate: request.fulfilledAt || update.fulfilledAt || new Date(),
                hospitalName: request.hospitalName || existingRequest.hospitalName
              };
              donor.donationHistory = donor.donationHistory || [];
              donor.donationHistory.push(historyEntry);
              // update last donation date on donor record
              donor.lastDonationDate = historyEntry.donationDate;
              await donor.save();

              // After recording history, remove the request and any recipient data
              await Request.findByIdAndDelete(request._id);
          }
        }
      }
    }

    res.json({ message: 'Request updated', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
