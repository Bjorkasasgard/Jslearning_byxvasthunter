import express from "express";
import indexRoute from "./routes/index.js";
import usersRoute from "./routes/users.js";
import registerRoute from "./routes/register.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/register", registerRoute);

app.listen(3000, () => console.log("Server running on port 3000"));
