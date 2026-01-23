const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const Joi = require("joi");

const prisma = require("../../prisma/client");
const crypto = require("crypto");
const orderService = require("../../services/orderService");

const buyValidation = Joi.object({
  ticketId: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
});

const buildEventImageSrc = (event) => {
  if (!event) return null;

  if (event.imageData) {
    return `data:${event.imageMime || "image/jpeg"};base64,${Buffer.from(event.imageData).toString("base64")}`;
  }

  return event.imageUrl || null;
};

const mapOrderView = (order) => {
  const items = (order.items || []).map((item) => {
    const event = item.ticket && item.ticket.event ? item.ticket.event : null;
    const imageSrc = buildEventImageSrc(event);

    return {
      ...item,
      ticket: {
        ...item.ticket,
        event: event ? { ...event, imageSrc } : event,
      },
    };
  });

  const totalPrice = items.reduce((sum, item) => {
    const price = item.ticket && typeof item.ticket.price === "number" ? item.ticket.price : 0;
    const qty = typeof item.quantity === "number" ? item.quantity : 0;
    return sum + price * qty;
  }, 0);

  return {
    ...order,
    user: order.user || null,
    items,
    totalPrice,
    status: order.status || "UNPAID",
  };
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

    const eventsRaw = await prisma.event.findMany({
      orderBy: { date: "asc" },
      take: 6,
      include: {
        tickets: true,
        createdBy: {
          select: {
            name: true,
            email: true,
            avatarData: true,
            avatarMime: true,
          },
        },
      },
    });

    const recommendedEvents = eventsRaw.map((event) => {
      const prices = (event.tickets || [])
        .map((t) => t.price)
        .filter((p) => typeof p === "number");

      const minPrice = prices.length ? Math.min(...prices) : null;

      const creator = event.createdBy;
      const creatorAvatar = creator && creator.avatarData
        ? `data:${creator.avatarMime || "image/png"};base64,${Buffer.from(creator.avatarData).toString("base64")}`
        : null;

      const imageSrc = event.imageData
        ? `data:${event.imageMime || "image/jpeg"};base64,${Buffer.from(event.imageData).toString("base64")}`
        : null;

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        minPrice,
        imageSrc,
        creatorName: creator ? creator.name || creator.email : null,
        creatorAvatar,
      };
    });

    const ordersView = orders.map(mapOrderView);

    res.render("pages/myOrders", {
      orders: ordersView,
      query: req.query || {},
      recommendedEvents,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id", auth, async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: {
        user: true,
        items: {
          include: {
            ticket: {
              include: {
                event: {
                  include: {
                    createdBy: {
                      select: { name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }
    let orderData = order;
    if (!orderData.qrToken) {
      const qrToken = crypto.randomBytes(16).toString("hex");
      orderData = await prisma.order.update({
        where: { id: orderData.id },
        data: { qrToken },
        include: {
          user: true,
          items: {
            include: {
              ticket: {
                include: {
                  event: {
                    include: {
                      createdBy: {
                        select: { name: true, email: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    const finalToken = orderData.qrToken || crypto.randomBytes(16).toString("hex");
    if (!orderData.qrToken) {
      await prisma.order.update({
        where: { id: orderData.id },
        data: { qrToken: finalToken },
      });
      orderData = { ...orderData, qrToken: finalToken };
    }

    const orderView = mapOrderView(orderData);
    const firstItem = orderView.items && orderView.items.length ? orderView.items[0] : null;
    const eventId = firstItem && firstItem.ticket && firstItem.ticket.event ? firstItem.ticket.event.id : null;

    if (eventId) {
      return res.redirect(`/event/${eventId}`);
    }

    return res.redirect("/my/orders");
  } catch (err) {
    next(err);
  }
});

const renderReceipt = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
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

    if (!order) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    let orderData = order;
    if (!orderData.qrToken) {
      const qrToken = crypto.randomBytes(16).toString("hex");
      orderData = await prisma.order.update({
        where: { id: orderData.id },
        data: { qrToken },
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
    }

    const finalToken = orderData.qrToken || crypto.randomBytes(16).toString("hex");
    if (!orderData.qrToken) {
      await prisma.order.update({
        where: { id: orderData.id },
        data: { qrToken: finalToken },
      });
      orderData = { ...orderData, qrToken: finalToken };
    }

    const orderView = mapOrderView(orderData);

    if (String(orderView.status).toUpperCase() !== "PAID") {
      return res.redirect("/my/orders");
    }

    const buyerData = await prisma.user.findUnique({
      where: { id: req.user && req.user.id ? req.user.id : orderData.userId },
      select: { name: true, email: true },
    });

    res.locals.hideChrome = true;
    res.locals.bodyClass = "receipt-body";
    res.locals.mainClass = "receipt-main";
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.render("pages/orderReceipt", {
      order: { ...orderView, qrToken: finalToken },
      buyer: buyerData,
      user: buyerData,
      qrToken: finalToken,
      baseUrl,
    });
  } catch (err) {
    next(err);
  }
};

router.get("/my/orders/:id/receipt", auth, renderReceipt);
router.get("/orders/:id/receipt", auth, renderReceipt);

router.get("/ticket/verify/:token", async (req, res, next) => {
  try {
    const token = String(req.params.token || "").trim();

    const order = await prisma.order.findFirst({
      where: { qrToken: token },
      include: {
        user: true,
        items: {
          include: {
            ticket: {
              include: {
                event: {
                  include: {
                    createdBy: {
                      select: { name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      const err = new Error("Ticket not found");
      err.status = 404;
      throw err;
    }

    const orderView = mapOrderView(order);
    const buyerData = order.user || null;

    res.locals.hideChrome = true;
    res.locals.bodyClass = "receipt-body";
    res.locals.mainClass = "receipt-main";

    res.render("pages/ticketVerify", { order: orderView, buyer: buyerData });
  } catch (err) {
    next(err);
  }
});

router.post("/orders", auth, async (req, res, next) => {
  try {
    const { error } = buyValidation.validate(req.body, { abortEarly: true });
    if (error) {
      const referer = req.get("referer") || "/";
      const message = encodeURIComponent(error.details[0].message);
      return res.redirect(`${referer}${referer.includes("?") ? "&" : "?"}error=${message}`);
    }

    const ticketId = Number(req.body.ticketId);
    const quantity = Number(req.body.quantity);

    const order = await orderService.createOrder(req.user.id, [
      { ticketId, quantity },
    ]);

    res.redirect(`/my/orders?success=1&orderId=${order.id}`);
  } catch (err) {
    const referer = req.get("referer") || "/";
    const message = encodeURIComponent(err.message || "Order gagal diproses");
    return res.redirect(`${referer}${referer.includes("?") ? "&" : "?"}error=${message}`);
  }
});

module.exports = router;
