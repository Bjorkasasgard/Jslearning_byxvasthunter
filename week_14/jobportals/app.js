require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pump = promisify(pipeline);
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");

let csurf;
try {
  csurf = require("csurf");
} catch (e) {
  console.warn("csurf not installed; CSRF disabled");
  csurf = null;
}

const app = express();

/* ======================
   VIEW ENGINE
====================== */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");

/* ======================
   GLOBAL MIDDLEWARE
====================== */
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// Ensure view locals are always defined, even for non-view routes (e.g. /uploads)
// so layout.ejs never throws ReferenceError when rendering error pages.
app.use((req, res, next) => {
  if (typeof res.locals.currentUser === "undefined") res.locals.currentUser = null;
  if (typeof res.locals.notifications === "undefined") res.locals.notifications = [];
  next();
});

/* ======================
   UPLOAD STORAGE (PRIVATE)
====================== */
// Canonical upload root for this app (inside public)
// We still serve it via explicit /uploads routes (and block /storage/uploads direct access)
// to keep a single stable URL surface.
const uploadsRoot = path.join(__dirname, "public", "storage", "uploads");

try {
  fs.mkdirSync(path.join(uploadsRoot, "resumes"), { recursive: true });
  fs.mkdirSync(path.join(uploadsRoot, "application_letters"), { recursive: true });
} catch (e) {
  console.warn("[uploads] mkdir failed:", e.message);
}

function isSafeFilename(filename) {
  return (
    typeof filename === "string" &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  );
}

function getUploadExt(filename) {
  const ext = path.extname(String(filename || "")).toLowerCase();
  return ext;
}

function isAllowedUpload(bucket, filename) {
  const ext = getUploadExt(filename);

  // cover letters are PDF-only
  if (bucket === "application_letters") return ext === ".pdf";

  // resumes may be PDF/DOC/DOCX
  if (bucket === "resumes") return ext === ".pdf" || ext === ".doc" || ext === ".docx";

  return false;
}

function contentTypeForExt(ext) {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function contentDispositionForExt(ext, filename) {
  // PDFs render nicely in browser; Word docs should download.
  const safeName = String(filename || "file").replace(/\r|\n|"/g, "");
  if (ext === ".pdf") return "inline";
  return `attachment; filename="${safeName}"`;
}

/* ======================
   PDF STREAM (INLINE ONLY)
====================== */
async function streamUploadFile(res, absPath) {
  const stat = await fs.promises.stat(absPath);

  const ext = getUploadExt(absPath);

  res.setHeader("Content-Type", contentTypeForExt(ext));
  res.setHeader("Content-Disposition", contentDispositionForExt(ext, path.basename(absPath)));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Accept-Ranges", "none");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Length", stat.size);

  await pump(fs.createReadStream(absPath), res);
}

function isWithinAllowedRoots(candidatePath) {
  const allowedRoots = [
    path.resolve(uploadsRoot),
    path.resolve(path.join(__dirname, "public", "uploads")),
  ];
  const resolved = path.resolve(candidatePath);
  return allowedRoots.some((root) => resolved.startsWith(root));
}

/* ======================
   CURRENT UPLOAD ROUTES
====================== */
app.get(
  "/uploads/:bucket(resumes|application_letters)/:filename",
  async (req, res, next) => {
    try {
      const { bucket, filename } = req.params;

      if (!isSafeFilename(filename)) {
        return next(createError(400, "Invalid filename"));
      }

      if (!isAllowedUpload(bucket, filename)) {
        return next(createError(404, "Resource not found"));
      }

      const candidates = [
        path.join(uploadsRoot, bucket, filename),
        // legacy folder kept for backward compatibility if it exists
        path.join(__dirname, "public", "uploads", bucket, filename),
      ];

      const absPath = candidates.find((p) => fs.existsSync(p) && isWithinAllowedRoots(p));
      if (!absPath) return next(createError(404, "Resource not found"));

      await streamUploadFile(res, absPath);
    } catch (err) {
      return next(err);
    }
  }
);

/* ======================
   LEGACY UPLOAD ROUTES
====================== */
app.get("/uploads/applications/:filename", async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!isSafeFilename(filename)) {
      return next(createError(400, "Invalid filename"));
    }

    // legacy endpoint historically served PDFs only
    if (getUploadExt(filename) !== ".pdf") {
      return next(createError(404, "Resource not found"));
    }

    const candidates = [
      path.join(uploadsRoot, "application_letters", filename),
      path.join(uploadsRoot, "resumes", filename),
      path.join(__dirname, "public", "uploads", "applications", filename),
      path.join(__dirname, "public", "uploads", "application_letters", filename),
      path.join(__dirname, "public", "uploads", "resumes", filename),
    ];

    const absPath = candidates.find((p) => fs.existsSync(p) && isWithinAllowedRoots(p));
    if (!absPath) {
      return next(createError(404, "Resource not found"));
    }

    await streamUploadFile(res, absPath);
  } catch (err) {
    return next(err);
  }
});

/* ======================
   BLOCK DIRECT /uploads
====================== */
app.use("/uploads", (req, res, next) =>
  next(createError(404, "Resource not found"))
);

// Also block direct access to physical upload directory under /storage/uploads
// so users always go through /uploads/*.
app.use("/storage/uploads", (req, res, next) =>
  next(createError(404, "Resource not found"))
);

/* ======================
   PUBLIC STATIC
====================== */
app.use(express.static(path.join(__dirname, "public")));

/* ======================
   VIEW HELPERS
====================== */
const { attachCurrentUser } = require("./middleware/viewAuth");
app.use(attachCurrentUser);
app.use(require("./middleware/alerts"));
app.use(require("./middleware/uiContext"));

// express-ejs-layouts only forwards the `options` passed to res.render() into the layout.
// Bridge commonly-used res.locals into render options so layout.ejs can safely reference them.
app.use((req, res, next) => {
  const originalRender = res.render;

  res.render = function renderWithLocals(view, options, callback) {
    let opts = options;
    let cb = callback;

    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }

    opts = opts || {};

    if (typeof opts.currentUser === "undefined") opts.currentUser = res.locals.currentUser;
    if (typeof opts.notifications === "undefined") opts.notifications = res.locals.notifications;
    if (typeof opts.alerts === "undefined") opts.alerts = res.locals.alerts;
    if (typeof opts.isAdminPage === "undefined") opts.isAdminPage = res.locals.isAdminPage;

    return originalRender.call(this, view, opts, cb);
  };

  next();
});

/* ======================
   API ROUTES
====================== */
if (csurf) {
  app.use("/api", csurf({ cookie: true }));
  app.use("/api/csrf", require("./routes/api/csrf"));
} else {
  app.get("/api/csrf", (req, res) => res.json({ csrfToken: "" }));
}

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/vacancies", require("./routes/api/vacancies"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/member", require("./routes/api/member"));

/* ======================
   PUBLIC ROUTES
====================== */
app.use("/auth", require("./routes/public/auth"));
app.use("/jobs", require("./routes/public/jobs"));
app.use("/admin", require("./routes/public/admin"));
app.use("/profile", require("./routes/public/profile"));
app.use("/applications", require("./routes/public/applications"));

/* ======================
   HOME
====================== */
app.get("/", (req, res) => {
  res.redirect("/jobs");
});

/* ======================
   ERROR HANDLING
====================== */
const { notFound, errorHandler } = require("./middleware/error");
app.use(notFound);
app.use(errorHandler);

module.exports = app;
