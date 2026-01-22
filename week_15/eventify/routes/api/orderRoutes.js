const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const validate = require("../../middlewares/validateMiddleware");

const controller = require("../../controllers/orderController");
const validation = require("../../validations/orderValidation");

router.post(
	"/",
	auth,
	validate({ body: validation.createOrder }),
	controller.create
);

module.exports = router;
