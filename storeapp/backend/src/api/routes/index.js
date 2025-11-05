// /backend/src/api/routes/index.js
const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const orderRoutes = require('./ordersRoutes');

// Semua rute di sini akan berawalan /api
router.use('/products', productRoutes); // -> /api/products
router.use('/users', userRoutes); // -> /api/users
router.use('/orders', orderRoutes); // -> /api/orders

module.exports = router;