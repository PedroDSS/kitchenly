const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, passwordResetLimiter, emailLimiter, createAccountLimiter } = require('../middleware/rateLimiter');

router.post('/register', createAccountLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/confirm-email/:token', authController.confirmEmail);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/resend-confirmation', emailLimiter, authController.resendConfirmation);

module.exports = router;