const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const role = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const controller = require("../../controllers/adminUserController");
const validation = require("../../validations/userValidation");

router.use(auth, role("ADMIN"));

router.get(
  "/users",
  validate({ query: validation.roleQuery }),
  controller.listUsers
);

router.patch(
  "/users/:id/role",
  validate({ params: validation.userIdParams, body: validation.updateRole }),
  controller.updateRole
);

module.exports = router;
