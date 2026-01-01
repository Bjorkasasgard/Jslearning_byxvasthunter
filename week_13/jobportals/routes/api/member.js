// rest ednpoints for members (api)

const express = require("express");
const router = express.Router();
const MemberController = require("../../controllers/memberController");
const {
  authenticateToken,
  requireMember,
} = require("../../middleware/auth");

router.use(authenticateToken, requireMember);

router.get("/applications", MemberController.myApplications);
router.get("/applications/:id", MemberController.applicationDetail);

// update own profile
router.put('/profile', MemberController.updateProfile);

module.exports = router;
