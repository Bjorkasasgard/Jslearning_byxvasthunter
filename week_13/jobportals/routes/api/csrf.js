const express = require('express');
const router = express.Router();

// returns CSRF token for frontend to include in mutating requests
router.get('/', (req, res) => {
  try {
    const token = req.csrfToken();
    res.json({ csrfToken: token });
  } catch (err) {
    res.status(500).json({ message: 'Could not generate csrf token' });
  }
});

module.exports = router;
