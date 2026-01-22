const validateTarget = (schema, value, target) => {
  const { error } = schema.validate(value);
  if (error) {
    return {
      message: error.details[0].message,
      target,
    };
  }
  return null;
};

module.exports = (schema) => (req, res, next) => {
  if (!schema) return next();

  // Backward-compatible: if schema is a Joi schema, validate body only
  if (typeof schema.validate === "function") {
    const result = validateTarget(schema, req.body, "body");
    if (result) {
      return res.status(400).json({ message: result.message });
    }
    return next();
  }

  const errors = [];

  if (schema.body) {
    const err = validateTarget(schema.body, req.body, "body");
    if (err) errors.push(err);
  }

  if (schema.params) {
    const err = validateTarget(schema.params, req.params, "params");
    if (err) errors.push(err);
  }

  if (schema.query) {
    const err = validateTarget(schema.query, req.query, "query");
    if (err) errors.push(err);
  }

  if (errors.length) {
    return res.status(400).json({ message: errors[0].message });
  }

  return next();
};
