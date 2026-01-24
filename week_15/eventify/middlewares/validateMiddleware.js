const validateTarget = (schema, value, target) => {
  const { error, value: sanitized } = schema.validate(value, { abortEarly: true, allowUnknown: true, stripUnknown: true });
  if (error) {
    return {
      message: error.details[0].message,
      target,
    };
  }
  return { sanitized };
};

module.exports = (schema) => (req, res, next) => {
  if (!schema) return next();

  // Backward-compatible: if schema is a Joi schema, validate body only
  if (typeof schema.validate === "function") {
    const result = validateTarget(schema, req.body, "body");
    if (result && result.message) {
      return res.status(400).json({ message: result.message });
    }
    if (result && result.sanitized) {
      req.body = result.sanitized;
    }
    return next();
  }

  const errors = [];

  if (schema.body) {
    const resBody = validateTarget(schema.body, req.body, "body");
    if (resBody && resBody.message) errors.push(resBody);
    if (resBody && resBody.sanitized) req.body = resBody.sanitized;
  }

  if (schema.params) {
    const resParams = validateTarget(schema.params, req.params, "params");
    if (resParams && resParams.message) errors.push(resParams);
    if (resParams && resParams.sanitized) req.params = resParams.sanitized;
  }

  if (schema.query) {
    const resQuery = validateTarget(schema.query, req.query, "query");
    if (resQuery && resQuery.message) errors.push(resQuery);
    if (resQuery && resQuery.sanitized) req.query = resQuery.sanitized;
  }

  if (errors.length) {
    return res.status(400).json({ message: errors[0].message });
  }

  return next();
};
