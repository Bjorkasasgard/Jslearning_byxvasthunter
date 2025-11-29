import { UserModel } from "../models/UserModel.js";

export const showUsers = (req, res) => {
  UserModel.getAllUsers((err, rows) => {
    res.render("users", { users: rows });
  });
};
