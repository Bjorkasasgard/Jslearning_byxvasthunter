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
router.post("/applications/:id/read", MemberController.markNotificationRead);

// update own profile
router.put('/profile', MemberController.updateProfile);

// resume upload (multipart/form-data)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = `${req.user.id}_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

router.post('/profile/resume', upload.single('resume'), MemberController.uploadResume);

module.exports = router;
