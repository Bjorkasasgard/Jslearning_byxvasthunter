const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get("/register", registerController.showForm);
router.post("/register", registerController.registerUser);

module.exports = router;
