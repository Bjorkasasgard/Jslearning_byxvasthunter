const Joi = require("joi");

exports.register = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Nama lengkap wajib diisi.",
    "string.min": "Nama minimal 3 karakter.",
    "any.required": "Nama lengkap wajib diisi.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email wajib diisi.",
    "string.email": "Format email tidak valid.",
    "any.required": "Email wajib diisi.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password wajib diisi.",
    "string.min": "Password minimal 6 karakter.",
    "any.required": "Password wajib diisi.",
  }),
});

exports.login = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email wajib diisi.",
    "string.email": "Format email tidak valid.",
    "any.required": "Email wajib diisi.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password wajib diisi.",
    "any.required": "Password wajib diisi.",
  }),
});
