// penggabungan API// /backend/src/api/routes/index.js
const express = require('express');
const router = express.Router();

const productRoutes = require('./products.routes');
const userRoutes = require('./user.routes');
const orderRoutes = require('./orders.routes');

// Semua rute di sini akan berawalan /api
router.use('/products', productRoutes); // -> /api/products
router.use('/users', userRoutes); // -> /api/users
router.use('/orders', orderRoutes); // -> /api/orders

module.exports = router;