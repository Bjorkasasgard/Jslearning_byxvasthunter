const Joi = require("joi");

exports.userIdParams = Joi.object({
  id: Joi.number().required(),
});

exports.updateRole = Joi.object({
  role: Joi.string().valid("ADMIN", "USER").required(),
});

exports.roleQuery = Joi.object({
  role: Joi.string().valid("ADMIN", "USER").optional(),
});
