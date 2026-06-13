const Donor = require('../models/Donor');

/* ── GET /admin/history
   Returns every donation entry across all donors, newest first.
   Each entry is enriched with donor info (id, name, bloodGroup).
*/
exports.listAllHistory = async (req, res) => {
  try {
    const donors = await Donor.find(
      { 'donationHistory.0': { $exists: true } },
      { fullName: 1, bloodGroup: 1, donationHistory: 1 }
    ).lean();

    const entries = [];
    for (const donor of donors) {
      for (const h of donor.donationHistory) {
        entries.push({
          donorId:       donor._id,
          donorName:     donor.fullName,
          donorBloodGroup: donor.bloodGroup,
          recipientName: h.recipientName || '—',
          bloodGroup:    h.bloodGroup,
          donationDate:  h.donationDate,
          hospitalName:  h.hospitalName || '—',
          notes:         h.notes || '',
          requestId:     h.requestId || null,
          entryId:       h._id || null,
        });
      }
    }

    // newest first
    entries.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));

    res.json({ history: entries, total: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ── POST /admin/history
   Body: { donorId, recipientName, bloodGroup, donationDate, hospitalName, notes }
   donorId is required; looks up the donor, adds the entry, updates lastDonationDate.
*/
exports.addHistory = async (req, res) => {
  try {
    const { donorId, recipientName, bloodGroup, donationDate, hospitalName, notes } = req.body;

    if (!donorId || !bloodGroup || !donationDate || !hospitalName) {
      return res.status(400).json({ error: 'donorId, bloodGroup, donationDate and hospitalName are required.' });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ error: 'Donor not found.' });

    donor.donationHistory.push({
      recipientName: recipientName || undefined,
      bloodGroup,
      donationDate:  new Date(donationDate),
      hospitalName,
      notes:         notes || undefined,
    });

    // keep lastDonationDate as the most recent entry
    const latest = donor.donationHistory.reduce((max, h) =>
      new Date(h.donationDate) > new Date(max.donationDate) ? h : max
    );
    donor.lastDonationDate = new Date(latest.donationDate);

    await donor.save();

    res.status(201).json({ message: 'Donation history entry added.', donor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
