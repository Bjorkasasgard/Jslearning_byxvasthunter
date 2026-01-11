// rest enpoints for vacancies (api)
const express = require("express");
const router = express.Router();
const VacancyController = require("../../controllers/vacancyController");
const {
  authenticateToken,
  requireMember,
} = require("../../middleware/auth");
const { body, param, query } = require("express-validator");
const validate = require("../../middleware/validate");

// uploads for applications (cover letter + resume override)
const multer = require('multer');
const path = require('path');

const fs = require('fs');
// Store uploads inside canonical path: week_13/jobportals/public/storage/uploads/
const canonicalUploadsRoot = path.join(__dirname, '..', '..', 'public', 'storage', 'uploads');
const coverLetterDir = path.join(canonicalUploadsRoot, 'application_letters');
const resumeDir = path.join(canonicalUploadsRoot, 'resumes');
if (!fs.existsSync(coverLetterDir)) fs.mkdirSync(coverLetterDir, { recursive: true });
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

// Guard and log to ensure we never escape the canonical uploads root
const resolvedUploadsRoot = path.resolve(canonicalUploadsRoot);
const resolvedCoverDir = path.resolve(coverLetterDir);
const resolvedResumeDir = path.resolve(resumeDir);
if (!resolvedCoverDir.startsWith(resolvedUploadsRoot) || !resolvedResumeDir.startsWith(resolvedUploadsRoot)) {
  throw new Error(`[vacancies uploads] invalid dir: cover=${resolvedCoverDir} resume=${resolvedResumeDir}`);
}
console.info('[vacancies uploads] coverLetterDir:', resolvedCoverDir);
console.info('[vacancies uploads] resumeDir:', resolvedResumeDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'coverLetterFile') return cb(null, coverLetterDir);
    if (file.fieldname === 'resumeFile') return cb(null, resumeDir);
    return cb(null, canonicalUploadsRoot);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${req.user?.id || 'guest'}_${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

const applicationUpload = (req, res, next) => {
  const handler = upload.fields([
    { name: 'coverLetterFile', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 },
  ]);

  handler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.get(
  "/public",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status").optional().isIn(["ACTIVE", "CLOSED"]).withMessage("Invalid status"),
  ],
  validate,
  VacancyController.publicList
);

router.get(
  "/",
  authenticateToken,
  VacancyController.list
);
router.get(
  "/:id",
  authenticateToken,
  [param("id").isInt().withMessage("id must be a number")],
  validate,
  VacancyController.detail
);
router.post(
  "/:id/apply",
  authenticateToken,
  requireMember,
  [
    param("id").isInt().withMessage("id must be a number"),
    body("coverLetter").optional().isString().trim().isLength({ max: 5000 }).withMessage("Cover letter too long"),
    body("answers")
      .optional()
      .custom((value) => {
        if (Array.isArray(value)) return value.every((v) => typeof v === "string");
        return typeof value === "string";
      })
      .withMessage("answers must be a string or array of strings")
      .customSanitizer((value) => {
        if (typeof value === "string") return [value];
        return value;
      }),
    body("answers.*").optional().isString().trim().isLength({ max: 1000 }).withMessage("Each answer must be under 1000 characters"),
  ],
  validate,
  applicationUpload,
  VacancyController.apply
);

module.exports = router;
