const express = require('express');
const router = express.Router();
const {
  logDonation,
  getDonationHistory,
  getDonationsByRequest,
  cancelDonation
} = require('../controllers/donationController');
const { auth } = require('../middleware/auth');

router.post('/', auth, logDonation);
router.get('/donor/:donorId', getDonationHistory);
router.get('/request/:requestId', getDonationsByRequest);
router.delete('/:id', auth, cancelDonation);

module.exports = router;
