const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/update-password', authLimiter, userController.updatePassword);
router.put('/update-email', authLimiter, userController.updateEmail);
router.delete('/account', authLimiter, userController.deleteAccount);
router.post('/export-data', userController.exportUserData);

module.exports = router;