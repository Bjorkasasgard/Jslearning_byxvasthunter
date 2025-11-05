// /backend/src/api/routes/products.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
} = require('../controllers/products.controller');

// Rute ini akan menjadi /api/products
router.get('/', getAllProducts);

// Rute ini akan menjadi /api/products/:id
router.get('/:id', getProductById);

module.exports = router;