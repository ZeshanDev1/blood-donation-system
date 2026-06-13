const Volunteer = require('../models/Volunteer');

/* ── POST /public/volunteers  (public registration) ── */
exports.registerVolunteer = async (req, res) => {
  try {
    const {
      fullName, email, phone, city, gender, age, occupation,
      skills, previousExperience, organizationName, consent,
    } = req.body;

    if (!fullName || !email || !phone || !city || !gender || !age || !occupation ||
        !skills || skills.length === 0 || previousExperience === undefined || !consent) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const volunteer = await Volunteer.create({
      fullName, email, phone, city, gender,
      age: Number(age),
      occupation,
      skills,
      previousExperience: Boolean(previousExperience),
      organizationName: organizationName || undefined,
      consent: Boolean(consent),
    });

    res.status(201).json({ message: 'Volunteer registration submitted successfully!', volunteer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ── GET /admin/volunteers  (admin list) ── */
exports.listVolunteers = async (req, res) => {
  try {
    const { status, q } = req.query;
    const query = {};
    if (status) query.status = status;
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { city: regex }];
    }
    const volunteers = await Volunteer.find(query).sort({ createdAt: -1 });
    res.json({ volunteers, total: volunteers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ── PATCH /admin/volunteers/:id  (update status) ── */
exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' });
    res.json({ message: 'Status updated.', volunteer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ── DELETE /admin/volunteers/:id ── */
exports.deleteVolunteer = async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Volunteer record deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
