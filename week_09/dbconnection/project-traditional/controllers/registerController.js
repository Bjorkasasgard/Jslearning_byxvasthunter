import { RegisterModel } from "../models/RegisterModel.js";

export const showRegisterPage = (req, res) => {
  res.render("register");
};

export const handleRegister = (req, res) => {
  RegisterModel.registerUser(req.body, (err) => {
    if (err) return res.send("Error: " + err);
    res.redirect("/users");
  });
};
