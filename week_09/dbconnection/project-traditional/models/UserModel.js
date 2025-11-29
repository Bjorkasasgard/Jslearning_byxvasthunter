import db from "../config/db.js";

export const UserModel = {
  getAllUsers(callback) {
    db.all("SELECT * FROM users", callback);
  }
};
