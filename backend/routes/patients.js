const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile
} = require('../controllers/patientController');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, getPatientProfile);
router.put('/profile', auth, updatePatientProfile);

module.exports = router;
