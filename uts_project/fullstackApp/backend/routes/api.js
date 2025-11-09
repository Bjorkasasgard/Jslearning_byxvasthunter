import express from 'express';
import { getProducts, getProductById, saveProduct, updateProduct, deleteProduct } from '../controllers/ProductController.js';
import { getUsers, getUserById, Register, updateUser, deleteUser } from '../controllers/UserController.js';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/OrderController.js';

const router = express.Router();

// Product Routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', saveProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// User Routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/register', Register);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Order Routes
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;