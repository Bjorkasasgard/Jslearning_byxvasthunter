const Joi = require("joi");

exports.createOrder = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        ticketId: Joi.number().required(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .min(1)
    .required(),
});
