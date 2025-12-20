const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, dashboardController.index);

module.exports = router;
