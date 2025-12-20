const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const authMiddleware = require('../middlewares/authMiddleware');

const { isAuthenticated } = authMiddleware;

router.get('/', isAuthenticated, (req, res) => {
  res.render('incident/form');
});
router.post('/', isAuthenticated, incidentController.createIncident);
router.get('/result/:id', isAuthenticated, incidentController.showResult);

module.exports = router;
