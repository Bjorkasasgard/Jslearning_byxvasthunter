const Joi = require("joi");

exports.createTicket = Joi.object({
  eventId: Joi.number().required(),
  price: Joi.number().min(0).required(),
  quota: Joi.number().min(1).required(),
});

exports.eventIdParams = Joi.object({
  eventId: Joi.number().required(),
});
