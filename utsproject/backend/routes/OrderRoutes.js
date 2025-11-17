import express from "express";
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus
} from "../controllers/OrderController.js";

const router = express.Router();

router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;