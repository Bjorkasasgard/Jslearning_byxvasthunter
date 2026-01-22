const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");

const eventService = require("../../services/eventService");
const ticketService = require("../../services/ticketService");
const prisma = require("../../prisma/client");

const eventValidation = require("../../validations/eventValidation");
const ticketValidation = require("../../validations/ticketValidation");

router.get("/admin", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: { tickets: true },
    });

    res.render("pages/admin", { events });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/admin/events",
  auth,
  role("ADMIN"),
  validate({ body: eventValidation.createEvent }),
  async (req, res, next) => {
    try {
      await eventService.createEvent({
        ...req.body,
        date: new Date(req.body.date),
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
