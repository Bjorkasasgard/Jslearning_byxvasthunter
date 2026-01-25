const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const multer = require("multer");

// Upload middleware must be declared before any usage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("File harus berupa gambar"));
  },
});

const eventService = require("../../services/eventService");
const ticketService = require("../../services/ticketService");
const prisma = require("../../prisma/client");

const eventValidation = require("../../validations/eventValidation");
const ticketValidation = require("../../validations/ticketValidation");

// ...existing code...

// EDIT event form
router.get("/admin/events/:id/edit", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = await eventService.getEventById(eventId);
    if (!event) throw new Error("Event tidak ditemukan");
    applyAdminLayout(res);
    res.render("pages/admin/editEvent", { event, pageTitle: "Edit Event" });
  } catch (err) {
    next(err);
  }
});

// UPDATE event
router.post(
  "/admin/events/:id/edit",
  auth,
  role("ADMIN"),
  upload.single("imageFile"),
  async (req, res, next) => {
    try {
      const eventId = Number(req.params.id);
      // Hanya ambil field yang diisi user
      let updateData = {};
      if (req.body.title && req.body.title.trim() !== "") updateData.title = req.body.title;
      if (req.body.location && req.body.location.trim() !== "") updateData.location = req.body.location;
      if (req.body.date && req.body.date.trim() !== "") updateData.date = new Date(req.body.date);
      if (req.body.description && req.body.description.trim() !== "") updateData.description = req.body.description;
      if (req.file) {
        updateData.imageData = req.file.buffer;
        updateData.imageMime = req.file.mimetype;
      }
      if (Object.keys(updateData).length === 0) {
        return res.redirect("/admin/events");
      }
      // Validasi hanya field yang diupdate
      const Joi = require("joi");
      const dynamicSchema = Joi.object({
        title: Joi.string().min(3),
        location: Joi.string(),
        date: Joi.date(),
        description: Joi.string().min(10),
        imageData: Joi.any(),
        imageMime: Joi.any(),
      });
      const { error } = dynamicSchema.validate(updateData);
      if (error) {
        // Fetch original event for sticky form fields
        const event = await eventService.getEventById(eventId);
        // Overwrite with attempted user input for sticky form
        const stickyEvent = { ...event, ...updateData };
        applyAdminLayout(res);
        return res.status(400).render("pages/admin/editEvent", {
          event: stickyEvent,
          pageTitle: "Edit Event",
          errorMessage: error.details[0].message
        });
      }
      await eventService.updateEvent(eventId, updateData);
      res.redirect("/admin/events");
    } catch (err) {
      next(err);
    }
  }
);

// DELETE event
router.post("/admin/events/:id/delete", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    await eventService.deleteEvent(eventId);
    res.redirect("/admin/events");
  } catch (err) {
    next(err);
  }
});

const buildOrdersView = (orders, adminId) => {
  return orders.map((order) => {
    const items = (order.items || []).filter((item) => {
      return (
        item.ticket &&
        item.ticket.event &&
        item.ticket.event.createdById === adminId
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
};

const applyAdminLayout = (res) => {
  res.locals.layout = "layouts/admin";
  res.locals.hideChrome = true;
  res.locals.bodyClass = "admin-body";
  res.locals.mainClass = "admin-page";
};

// ...existing code...

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

    const ordersView = buildOrdersView(orders, req.user.id);

    const orderStats = {
      total: ordersView.length,
      paid: ordersView.filter((o) => String(o.status).toUpperCase() === "PAID").length,
      unpaid: ordersView.filter((o) => String(o.status).toUpperCase() === "UNPAID").length,
    };

    const totalSales = ordersView.reduce((sum, order) => {
      return String(order.status).toUpperCase() === "PAID" ? sum + order.totalPrice : sum;
    }, 0);

    const totalTicketsSold = ordersView.reduce((sum, order) => {
      return String(order.status).toUpperCase() === "PAID" ? sum + order.totalQty : sum;
    }, 0);

    const customerCount = new Set(
      ordersView.map((order) => order.user && order.user.id).filter(Boolean)
    ).size;

    const latestOrders = ordersView.slice(0, 5);
    applyAdminLayout(res);

    res.render("pages/admin/admin", {
      events,
      orders: latestOrders,
      orderStats,
      totalSales,
      totalTicketsSold,
      customerCount,
      pageTitle: "Admin Dashboard",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/events", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { createdById: req.user.id },
      orderBy: { date: "asc" },
      include: { tickets: true },
    });

    applyAdminLayout(res);

    res.render("pages/admin/events", {
      events,
      pageTitle: "Daftar Event",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/events/create", auth, role("ADMIN"), async (req, res, next) => {
  try {
    applyAdminLayout(res);

    res.render("pages/admin/createEvent", {
      pageTitle: "Buat Event",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/tickets", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { createdById: req.user.id },
      orderBy: { date: "asc" },
      include: { tickets: true },
    });

    applyAdminLayout(res);

    res.render("pages/admin/tickets", {
      events,
      pageTitle: "Kelola Tiket",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/orders", auth, role("ADMIN"), async (req, res, next) => {
  try {
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

    const ordersView = buildOrdersView(orders, req.user.id);
    const orderStats = {
      total: ordersView.length,
      paid: ordersView.filter((o) => String(o.status).toUpperCase() === "PAID").length,
      unpaid: ordersView.filter((o) => String(o.status).toUpperCase() === "UNPAID").length,
    };

    applyAdminLayout(res);

    res.render("pages/admin/orders", {
      orders: ordersView,
      orderStats,
      pageTitle: "Monitoring Pesanan",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/members", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    applyAdminLayout(res);

    res.render("pages/admin/members", {
      users,
      currentUserId: req.user.id,
      pageTitle: "Kelola Anggota",
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

    res.redirect("/admin/orders");
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
      res.redirect("/admin/events");
    } catch (err) {
      next(err);
    }
  }
);


// CREATE ticket
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
      res.redirect("/admin/tickets");
    } catch (err) {
      next(err);
    }
  }
);

// EDIT ticket form
router.get("/admin/tickets/:id/edit", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await ticketService.getTicketById(ticketId);
    const events = await prisma.event.findMany({
      where: { createdById: req.user.id },
      orderBy: { date: "asc" },
    });
    if (!ticket) throw new Error("Tiket tidak ditemukan");
    applyAdminLayout(res);
    res.render("pages/admin/editTicket", { ticket, events, pageTitle: "Edit Tiket" });
  } catch (err) {
    next(err);
  }
});

// UPDATE ticket (fleksibel, hanya field yang diisi yang diupdate)
router.post(
  "/admin/tickets/:id/edit",
  auth,
  role("ADMIN"),
  async (req, res, next) => {
    try {
      const ticketId = Number(req.params.id);
      let updateData = {};
      if (req.body.eventId && req.body.eventId.trim() !== "") updateData.eventId = Number(req.body.eventId);
      if (req.body.name && req.body.name.trim() !== "") updateData.name = req.body.name;
      if (req.body.price && req.body.price.trim() !== "") updateData.price = Number(req.body.price);
      if (req.body.quota && req.body.quota.trim() !== "") updateData.quota = Number(req.body.quota);
      if (Object.keys(updateData).length === 0) {
        return res.redirect("/admin/tickets");
      }
      // Validasi hanya field yang diupdate
      const Joi = require("joi");
      const dynamicSchema = Joi.object({
        eventId: Joi.number().integer(),
        name: Joi.string().min(2),
        price: Joi.number().min(0),
        quota: Joi.number().min(1),
      });
      const { error } = dynamicSchema.validate(updateData);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      await ticketService.updateTicket(ticketId, updateData);
      res.redirect("/admin/tickets");
    } catch (err) {
      next(err);
    }
  }
);

// DELETE ticket
router.post("/admin/tickets/:id/delete", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    await ticketService.deleteTicket(ticketId);
    res.redirect("/admin/tickets");
  } catch (err) {
    // Jika error karena foreign key / ticket terkait order, tunjukkan pesan pada halaman admin (dialog), jangan redirect
    const isConstraintError = err && (err.message && (err.message.toLowerCase().includes('pesanan') || err.message.toLowerCase().includes('related') || err.message.toLowerCase().includes('foreign')) || err.code === 'P2014' || err.code === 'P2003');
    if (isConstraintError) {
      try {
        const events = await prisma.event.findMany({
          where: { createdById: req.user.id },
          orderBy: { date: 'asc' },
          include: { tickets: true },
        });
        applyAdminLayout(res);
        return res.status(400).render('pages/admin/tickets', {
          events,
          pageTitle: 'Kelola Tiket',
          errorMessage: err.message || 'Tidak dapat menghapus tiket karena sudah ada pesanan terkait.',
        });
      } catch (e) {
        return next(err);
      }
    }

    return next(err);
  }
});

router.post("/admin/users/:id/role", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const roleValue = String(req.body.role || "").toUpperCase();

    if (!userId || !["ADMIN", "USER"].includes(roleValue)) {
      const err = new Error("Role tidak valid");
      err.status = 400;
      throw err;
    }

    if (userId === req.user.id && roleValue !== "ADMIN") {
      const err = new Error("Tidak dapat menurunkan role sendiri");
      err.status = 400;
      throw err;
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!target) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    if (target.role === "ADMIN" && roleValue === "USER") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        const err = new Error("Tidak dapat menurunkan admin terakhir");
        err.status = 400;
        throw err;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: roleValue },
    });

    res.redirect("/admin/members");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
