const express = require('express');
const router = express.Router();
const { registerDonor, searchDonors, createRequest } = require('../controllers/publicController');
const { listPublicEvents } = require('../controllers/eventController');
const { listPublicStories } = require('../controllers/storyController');
const { registerVolunteer } = require('../controllers/volunteerController');

router.post('/donors', registerDonor);
router.get('/donors/search', searchDonors);
router.post('/requests', createRequest);
router.get('/events', listPublicEvents);
router.get('/stories', listPublicStories);
router.post('/volunteers', registerVolunteer);

module.exports = router;
