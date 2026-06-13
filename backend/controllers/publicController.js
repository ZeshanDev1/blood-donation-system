const Donor = require('../models/Donor');
const Request = require('../models/Request');

const isValidPhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone || '');

exports.registerDonor = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      gender,
      age,
      bloodGroup,
      city,
      area,
      availability,
      lastDonationDate
    } = req.body;

    if (!fullName || !phone || !email || !gender || !age || !bloodGroup || !city || !area) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const ageNumber = Number(age);
    if (Number.isNaN(ageNumber) || ageNumber < 18) {
      return res.status(400).json({ error: 'Age must be 18 or above' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }

    const existing = await Donor.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: 'Donor already registered.' });
    }

    const donor = new Donor({
      fullName,
      phone,
      email,
      gender,
      age: ageNumber,
      bloodGroup,
      city,
      area,
      availability: availability || 'available',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined
    });

    await donor.save();

    res.status(201).json({ message: 'Donor registered successfully', donor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (!bloodGroup && !city) {
      return res.status(400).json({ error: 'Please provide blood group or city to search' });
    }

    const query = { availability: 'available' };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = { $regex: new RegExp(`^${city}`, 'i') };

    const donors = await Donor.find(query)
      .select('fullName phone email gender age bloodGroup city area availability lastDonationDate');

    res.json({ donors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const {
      recipientName,
      qimsId,
      age,
      gender,
      department,
      contactNumber,
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      area,
      urgency,
      notes
    } = req.body;

    // area and hospitalName are optional — form may not collect them
    if (!recipientName || !contactNumber || !bloodGroup || !unitsRequired || !city) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    if (!isValidPhone(contactNumber)) {
      return res.status(400).json({ error: 'Please provide a valid contact number' });
    }

    const request = new Request({
      recipientName,
      qimsId:       qimsId      || undefined,
      age:          age         ? Number(age) : undefined,
      gender:       gender      || undefined,
      department:   department  || undefined,
      contactNumber,
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospitalName: hospitalName || 'QIMS Hospital',
      city,
      area:         area        || city,
      urgency:      urgency     || 'medium',
      notes
    });

    await request.save();

    res.status(201).json({ message: 'Blood request submitted', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
