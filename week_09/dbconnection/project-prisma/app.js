const express = require('express');
const path = require('path');
const app = express();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// EJS SETUP
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ROUTES
app.use("/", require("./routes/indexRoutes"));
app.use("/", require("./routes/userRoutes"));
app.use("/", require("./routes/registerRoutes"));

// SERVER
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
