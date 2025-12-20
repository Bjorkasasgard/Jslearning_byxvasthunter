const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/incidents', adminController.viewIncidents);

module.exports = router;
