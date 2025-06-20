const express = require('express');
const router = express.Router();

// Placeholder auth routes
router.post('/login', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Auth routes not implemented yet'
  });
});

router.post('/register', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Auth routes not implemented yet'
  });
});

module.exports = router;