// Simple alerts middleware to project query-based messages into views
// Usage: add ?success=Saved or ?error=Failed to any GET redirect

module.exports = function alerts(req, res, next) {
  const alerts = [];
  const success = req.query.success;
  const error = req.query.error;

  if (success) alerts.push({ type: 'success', text: String(success) });
  if (error) alerts.push({ type: 'error', text: String(error) });

  res.locals.alerts = alerts;
  next();
};