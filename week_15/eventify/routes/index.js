const router = require("express").Router();

// PUBLIC UI
router.use("/", require("./public/homeRoutes"));
router.use("/", require("./public/orderRoutes"));
router.use("/", require("./public/adminRoutes"));

// API
router.use("/api/health", require("./api/healthRoutes"));
router.use("/api/auth", require("./api/authRoutes"));
router.use("/api/events", require("./api/eventRoutes"));
router.use("/api/tickets", require("./api/ticketRoutes"));
router.use("/api/orders", require("./api/orderRoutes"));

module.exports = router;
