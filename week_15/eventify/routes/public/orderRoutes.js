const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const Joi = require("joi");

const prisma = require("../../prisma/client");
const orderService = require("../../services/orderService");

const buyValidation = {
  body: Joi.object({
    ticketId: Joi.number().required(),
    quantity: Joi.number().min(1).required(),
  }),
};

router.get("/my/orders", auth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            ticket: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    res.render("pages/myOrders", { orders });
  } catch (err) {
    next(err);
  }
});

router.post("/orders", auth, validate(buyValidation), async (req, res, next) => {
  try {
    const ticketId = Number(req.body.ticketId);
    const quantity = Number(req.body.quantity);

    const order = await orderService.createOrder(req.user.id, [
      { ticketId, quantity },
    ]);

    res.redirect(`/my/orders?success=1&orderId=${order.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
