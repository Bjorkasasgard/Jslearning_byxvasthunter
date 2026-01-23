const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const multer = require("multer");

const eventService = require("../../services/eventService");
const ticketService = require("../../services/ticketService");
const prisma = require("../../prisma/client");

const eventValidation = require("../../validations/eventValidation");
const ticketValidation = require("../../validations/ticketValidation");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("File harus berupa gambar"));
  },
});

router.get("/admin", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { createdById: req.user.id },
      orderBy: { date: "asc" },
      include: { tickets: true },
    });

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            ticket: {
              event: {
                createdById: req.user.id,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
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

    const ordersView = orders.map((order) => {
      const items = (order.items || []).filter((item) => {
        return (
          item.ticket &&
          item.ticket.event &&
          item.ticket.event.createdById === req.user.id
        );
      });

      const totalPrice = items.reduce((sum, item) => {
        const price = item.ticket && typeof item.ticket.price === "number" ? item.ticket.price : 0;
        const qty = typeof item.quantity === "number" ? item.quantity : 0;
        return sum + price * qty;
      }, 0);

      const eventTitles = Array.from(
        new Set(
          items
            .map((item) => (item.ticket && item.ticket.event ? item.ticket.event.title : null))
            .filter(Boolean)
        )
      );

      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

      return {
        ...order,
        items,
        totalPrice,
        totalQty,
        eventTitle:
          eventTitles.length > 1
            ? `${eventTitles[0]} +${eventTitles.length - 1} lainnya`
            : eventTitles.length
              ? eventTitles[0]
              : "Event",
        status: order.status || "UNPAID",
      };
    });

    const orderStats = {
      total: ordersView.length,
      paid: ordersView.filter((o) => String(o.status).toUpperCase() === "PAID").length,
      unpaid: ordersView.filter((o) => String(o.status).toUpperCase() === "UNPAID").length,
    };

    res.locals.layout = "layouts/admin";
    res.locals.hideChrome = true;
    res.locals.bodyClass = "admin-body";
    res.locals.mainClass = "admin-page";

    res.render("pages/admin/admin", {
      events,
      orders: ordersView,
      orderStats,
      pageTitle: "Admin Dashboard",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/orders/:id/status", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const status = String(req.body.status || "").toUpperCase();

    if (!orderId || !["PAID", "UNPAID"].includes(status)) {
      const err = new Error("Status tidak valid");
      err.status = 400;
      throw err;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            ticket: {
              event: {
                createdById: req.user.id,
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

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.redirect("/admin#orders-monitoring");
  } catch (err) {
    next(err);
  }
});

router.post(
  "/admin/events",
  auth,
  role("ADMIN"),
upload.single("imageFile"),
  validate({ body: eventValidation.createEvent }),
  async (req, res, next) => {
    try {
      await eventService.createEvent({
        ...req.body,
        date: new Date(req.body.date),
        imageData: req.file ? req.file.buffer : undefined,
        imageMime: req.file ? req.file.mimetype : undefined,
        createdById: req.user.id,
      });
      res.redirect("/admin");
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/admin/tickets",
  auth,
  role("ADMIN"),
  validate({ body: ticketValidation.createTicket }),
  async (req, res, next) => {
    try {
      await ticketService.createTicket({
        eventId: Number(req.body.eventId),
        name: req.body.name,
        price: Number(req.body.price),
        quota: Number(req.body.quota),
      });
      res.redirect("/admin");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
