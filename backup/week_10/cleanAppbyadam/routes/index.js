var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', userController.getAllUsers);
router.get('/submit', userController.formUser);
router.post('/submit', userController.submitUser);
router.get('/edit/:id', userController.editUser);
router.post('/edit/:id', userController.updateUser);
// Use POST for delete to avoid performing state changes via GET
router.post('/delete/:id', userController.deleteUser);

module.exports = router;