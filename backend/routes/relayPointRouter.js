const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getRelayPoints,
  getRelayPoint,
  createRelayPoint,
  updateRelayPoint,
  deleteRelayPoint,
  updateRelayPointCapacity,
  getRelayPointAnalytics,
  searchNearbyRelayPoints
} = require('../controllers/relayPointController');

// Public route - search nearby relay points
router.get('/search/nearby', searchNearbyRelayPoints);

// Protected routes - require authentication and admin role
router.use(protect, restrictTo('ROLE_ADMIN'));

router
  .route('/')
  .get(getRelayPoints)
  .post(createRelayPoint);

router
  .route('/:id')
  .get(getRelayPoint)
  .put(updateRelayPoint)
  .delete(deleteRelayPoint);

router.put('/:id/capacity', updateRelayPointCapacity);
router.get('/:id/analytics', getRelayPointAnalytics);

module.exports = router;