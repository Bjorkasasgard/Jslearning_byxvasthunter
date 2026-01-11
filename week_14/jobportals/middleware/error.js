const createError = require('http-errors');

// 404 handler
function notFound(req, res, next) {
  next(createError(404, 'Resource not found'));
}

// centralized error handler with API vs HTML response
function errorHandler(err, req, res, next) {
  const isDev = req.app.get('env') === 'development';
  const status = err.status || 500;
  const message = err.message || 'Unexpected error';

  // API routes should return JSON consistently
  if (req.path.startsWith('/api')) {
    const payload = {
      error: {
        status,
        message,
      },
    };
    if (err.code) payload.error.code = err.code;
    if (isDev && err.stack) payload.error.stack = err.stack;
    return res.status(status).json(payload);
  }

  // For HTML views, render a friendly page
  res.locals.error = {
    status,
    message,
    stack: isDev ? err.stack : undefined,
  };
  res.status(status);
  return res.render('error', { title: status === 404 ? 'Page Not Found' : 'Something went wrong' });
}

module.exports = { notFound, errorHandler };