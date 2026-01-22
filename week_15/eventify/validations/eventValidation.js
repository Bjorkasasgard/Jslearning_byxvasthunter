const Joi = require("joi");

exports.createEvent = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().required(),
  date: Joi.date().required(),
});

exports.updateEvent = Joi.object({
  title: Joi.string().min(3).optional(),
  description: Joi.string().min(10).optional(),
  location: Joi.string().optional(),
  date: Joi.date().optional(),
});

exports.eventIdParams = Joi.object({
  id: Joi.number().required(),
});
