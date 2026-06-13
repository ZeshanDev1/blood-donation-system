const express = require('express');
const router = express.Router();
const {
  getDonorProfile,
  updateDonorProfile,
  getDonationHistory,
  getAvailability,
  updateAvailability,
  searchDonors
  
} = require('../controllers/donorController');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, getDonorProfile);
router.put('/profile', auth, updateDonorProfile);
router.get('/donations', auth, getDonationHistory);
router.get('/availability', auth, getAvailability);
router.put('/availability', auth, updateAvailability);
router.get('/search', searchDonors);


module.exports = router;
