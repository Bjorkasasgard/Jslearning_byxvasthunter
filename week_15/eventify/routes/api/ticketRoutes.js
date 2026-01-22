const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");

const controller = require("../../controllers/ticketController");
const validation = require("../../validations/ticketValidation");

router.get(
  "/event/:eventId",
  validate({ params: validation.eventIdParams }),
  controller.getByEvent
);

router.post(
  "/",
  auth,
  role("ADMIN"),
  validate({ body: validation.createTicket }),
  controller.create
);

module.exports = router;
