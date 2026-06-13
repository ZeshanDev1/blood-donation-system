const express = require('express');
const router = express.Router();
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  cancelBloodRequest,
  requestDonor
} = require('../controllers/requestController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createBloodRequest);
router.get('/', getBloodRequests);
router.post('/request-donor', auth, requestDonor);

// Donor-specific endpoints (static paths before param routes)
const { getIncomingRequests, respondToRequest, getRequestContact } = require('../controllers/requestController');

router.get('/incoming/list', auth, getIncomingRequests);
router.post('/:id/respond', auth, respondToRequest);
router.get('/:id/contact', auth, getRequestContact);

router.get('/:id', getBloodRequestById);
router.put('/:id', auth, updateBloodRequest);
router.delete('/:id', auth, cancelBloodRequest);

module.exports = router;
