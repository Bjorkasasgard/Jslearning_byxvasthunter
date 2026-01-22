const router = require("express").Router();
const validate = require("../../middlewares/validateMiddleware");
const controller = require("../../controllers/authController");
const validation = require("../../validations/authValidations");

router.post(
	"/register",
	validate({ body: validation.register }),
	controller.register
);
router.post("/login", validate({ body: validation.login }), controller.login);
router.post("/logout", controller.logout);

module.exports = router;
