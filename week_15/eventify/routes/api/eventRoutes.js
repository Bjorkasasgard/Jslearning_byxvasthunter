const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const controller = require("../../controllers/eventController");
const validation = require("../../validations/eventValidation");

// public
router.get("/", controller.getAll);
router.get(
	"/:id",
	validate({ params: validation.eventIdParams }),
	controller.getById
);

// admin
router.post(
	"/",
	auth,
	role("ADMIN"),
	validate({ body: validation.createEvent }),
	controller.create
);
router.put(
	"/:id",
	auth,
	role("ADMIN"),
	validate({ params: validation.eventIdParams, body: validation.updateEvent }),
	controller.update
);
router.delete(
	"/:id",
	auth,
	role("ADMIN"),
	validate({ params: validation.eventIdParams }),
	controller.remove
);

module.exports = router;
