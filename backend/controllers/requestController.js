const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

exports.createBloodRequest = async (req, res) => {
  try {
    const { bloodType, units, urgency, reason, hospital, neededBy } = req.body;

    const bloodRequest = new BloodRequest({
      patientId: req.user.userId,
      bloodType,
      units,
      urgency,
      reason,
      hospital,
      neededBy
    });

    await bloodRequest.save();

    res.status(201).json({
      message: 'Blood request created successfully',
      request: bloodRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBloodRequests = async (req, res) => {
  try {
    const { patientId, status } = req.query;

    let query = {};
    if (patientId) {
      query.patientId = patientId;
    }
    if (status) {
      query.status = status;
    }

    const requests = await BloodRequest.find(query)
      .populate('patientId', 'profile hospitalName')
      .populate('acceptedDonor', 'profile bloodType')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBloodRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('patientId')
      .populate('acceptedDonor')
      .populate('requestedDonors');

    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get requests targeted to the authenticated donor (requested or accepted)
exports.getIncomingRequests = async (req, res) => {
  try {
    const donorId = req.user.userId;

    const requests = await BloodRequest.find({
      $or: [
        { requestedDonors: donorId },
        { acceptedDonor: donorId }
      ]
    })
      .populate('patientId', 'profile email')
      .populate('acceptedDonor', 'profile email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Donor responds to a request: accept or reject
exports.respondToRequest = async (req, res) => {
  try {
    const donorId = req.user.userId;
    const { action } = req.body; // 'accept' or 'reject'
    const requestId = req.params.id;

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Ensure donor was invited/requested for this request
    const isRequested = request.requestedDonors.some(id => id.toString() === donorId);
    if (!isRequested && (!request.acceptedDonor || request.acceptedDonor.toString() !== donorId)) {
      return res.status(403).json({ error: 'You are not a target for this request' });
    }

    if (action === 'accept') {
      request.acceptedDonor = donorId;
      request.status = 'fulfilled';
      request.updatedAt = new Date();
      await request.save();

      return res.json({ message: 'Request accepted', request });
    }

    if (action === 'reject') {
      // remove donor from requestedDonors
      request.requestedDonors = request.requestedDonors.filter(id => id.toString() !== donorId);
      request.updatedAt = new Date();
      await request.save();

      return res.json({ message: 'Request rejected', request });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Provide contact info of accepted donor to the patient when request is fulfilled
exports.getRequestContact = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    const request = await BloodRequest.findById(requestId).populate('acceptedDonor', 'profile email');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Only the patient who created the request can retrieve donor contact info
    if (request.patientId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to view contact info' });
    }

    if (!request.acceptedDonor || request.status !== 'fulfilled') {
      return res.status(400).json({ error: 'No accepted donor yet' });
    }

    const donor = request.acceptedDonor;
    const contact = {
      fullName: donor.profile?.fullName || null,
      phone: donor.profile?.phone || null,
      email: donor.email || null,
      bloodType: donor.bloodType || null
    };

    res.json({ contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBloodRequest = async (req, res) => {
  try {
    const { status, acceptedDonor } = req.body;

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        acceptedDonor,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Blood request updated',
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Blood request cancelled',
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestDonor = async (req, res) => {
  try {
    const { requestId, donorId } = req.body;

    const bloodRequest = await BloodRequest.findByIdAndUpdate(
      requestId,
      { $addToSet: { requestedDonors: donorId } },
      { new: true }
    );

    res.json({
      message: 'Donor added to request',
      request: bloodRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
