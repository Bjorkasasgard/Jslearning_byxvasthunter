import db from "../config/db.js";

export const RegisterModel = {
  registerUser(data, callback) {
    const { name, email, password } = data;

    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      callback
    );
  }
};
