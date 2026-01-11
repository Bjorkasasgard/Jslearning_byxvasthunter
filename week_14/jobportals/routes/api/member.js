const express = require("express");
const router = express.Router();
const MemberController = require("../../controllers/memberController");
const {
  authenticateToken,
  requireMember,
} = require("../../middleware/auth");
const { body, param } = require("express-validator");
const validate = require("../../middleware/validate");

router.use(authenticateToken, requireMember);

router.get("/applications", MemberController.myApplications);
router.get(
  '/applications/by-job/:jobId',
  [param('jobId').isInt().withMessage('jobId must be a number')],
  validate,
  MemberController.applicationByJob
);
router.get(
  "/applications/:id",
  [param("id").isInt().withMessage('id must be a number')],
  validate,
  MemberController.applicationDetail
);
router.post(
  "/applications/:id/read",
  [param("id").isInt().withMessage('id must be a number')],
  validate,
  MemberController.markNotificationRead
);

// update own profile
router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('email').optional().normalizeEmail().isEmail(),
    body('password').optional().isLength({ min: 8, max: 100 }),
    body('phone').optional().isString().isLength({ max: 30 }),
    body('city').optional().trim().isLength({ max: 100 }),
    body().custom((value) => {
      const allowed = ['name', 'email', 'password', 'phone', 'city'];
      return allowed.some((field) => value[field] !== undefined && value[field] !== '');
    }).withMessage('Provide at least one field to update'),
  ],
  validate,
  MemberController.updateProfile
);

// resume upload (multipart/form-data)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Store uploads inside canonical path: week_13/jobportals/public/storage/uploads/resumes
const canonicalUploadsRoot = path.join(__dirname, '..', '..', 'public', 'storage', 'uploads');
const resumeDir = path.join(canonicalUploadsRoot, 'resumes');
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

// Guard and log to ensure we never escape the canonical uploads root
const resolvedResumeDir = path.resolve(resumeDir);
const resolvedUploadsRoot = path.resolve(canonicalUploadsRoot);
if (!resolvedResumeDir.startsWith(resolvedUploadsRoot)) {
  throw new Error(`[member uploads] invalid resumeDir: ${resolvedResumeDir}`);
}
console.info('[member uploads] resumeDir:', resolvedResumeDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumeDir);
  },
  filename: function (req, file, cb) {
    const unique = `${req.user.id}_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF/DOC/DOCX files are allowed'));
    }
    cb(null, true);
  }
});

// Wrapper to catch Multer errors and respond nicely (avoid 500)
const resumeUpload = (req, res, next) => {
  const handler = upload.single('resume');
  handler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    return next();
  });
};

router.post('/profile/resume', resumeUpload, MemberController.uploadResume);

module.exports = router;
