// /backend/src/api/routes/orders.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
} = require('../controllers/orders.controller');

// Rute ini akan menjadi /api/orders
router.get('/', getAllOrders);

// Rute ini akan menjadi /api/orders/:id
router.get('/:id', getOrderById);

module.exports = router;