const express = require('express');
const router = express.Router();

// Placeholder user routes
router.get('/', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'User routes not implemented yet'
  });
});

module.exports = router;