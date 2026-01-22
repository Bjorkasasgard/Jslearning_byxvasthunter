const orderService = require("../services/orderService");

exports.create = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(
      req.user.id,
      req.body.items
    );
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};
