const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const { eventUpload, storyUpload } = require('../middleware/upload');
const { login } = require('../controllers/adminAuthController');
const {
  getProfile,
  updateUsername,
  changePassword,
} = require('../controllers/adminSettingsController');
const {
  listDonors,
  deleteDonor,
  getStats: getDonorStats,
  getDonorHistory,
  addDonorHistory
} = require('../controllers/adminDonorController');
const {
  listRequests,
  updateRequest,
  deleteRequest
} = require('../controllers/adminRequestController');
const { getStats } = require('../controllers/adminStatsController');
const { listAllHistory, addHistory } = require('../controllers/adminHistoryController');
const { listVolunteers, updateVolunteerStatus, deleteVolunteer } = require('../controllers/volunteerController');
const {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const {
  listStories,
  createStory,
  updateStory,
  deleteStory
} = require('../controllers/storyController');

router.post('/login', login);

router.get('/settings/profile', adminAuth, getProfile);
router.patch('/settings/username', adminAuth, updateUsername);
router.patch('/settings/password', adminAuth, changePassword);

router.get('/stats', adminAuth, getStats);

router.get('/history', adminAuth, listAllHistory);
router.post('/history', adminAuth, addHistory);

router.get('/donors', adminAuth, listDonors);
router.get('/donors/stats', adminAuth, getDonorStats);
router.get('/donors/:id/history', adminAuth, getDonorHistory);
router.post('/donors/:id/history', adminAuth, addDonorHistory);
router.delete('/donors/:id', adminAuth, deleteDonor);

router.get('/requests', adminAuth, listRequests);
router.patch('/requests/:id', adminAuth, updateRequest);
router.delete('/requests/:id', adminAuth, deleteRequest);

router.get('/volunteers', adminAuth, listVolunteers);
router.patch('/volunteers/:id', adminAuth, updateVolunteerStatus);
router.delete('/volunteers/:id', adminAuth, deleteVolunteer);

router.get('/events', adminAuth, listEvents);
router.post('/events', adminAuth, eventUpload.single('image'), createEvent);
router.patch('/events/:id', adminAuth, eventUpload.single('image'), updateEvent);
router.delete('/events/:id', adminAuth, deleteEvent);

router.get('/stories', adminAuth, listStories);
router.post('/stories', adminAuth, storyUpload.single('image'), createStory);
router.patch('/stories/:id', adminAuth, storyUpload.single('image'), updateStory);
router.delete('/stories/:id', adminAuth, deleteStory);

module.exports = router;
