// /backend/src/api/controllers/orders.controller.js
const orderService = require('../../services/json.service.js');

// GET /api/orders
async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.readOrdersData();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id
async function getOrderById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const order = await orderService.findOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
};