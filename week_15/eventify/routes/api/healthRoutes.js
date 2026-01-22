const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "eventify" });
});

module.exports = router;
