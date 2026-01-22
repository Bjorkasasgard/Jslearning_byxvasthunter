const authService = require("../services/authService");

const expectsHtml = (req) => {
  const accept = (req.headers.accept || "").toLowerCase();
  return accept.includes("text/html") || accept.includes("*/*");
};

const isJsonRequest = (req) => {
  const contentType = (req.headers["content-type"] || "").toLowerCase();
  const accept = (req.headers.accept || "").toLowerCase();
  return contentType.includes("application/json") || accept.includes("application/json");
};

const renderAuthPage = (res, view, options = {}) => {
  const {
    status = 400,
    message = null,
    values = {},
  } = options;

  return res.status(status).render(view, {
    pageTitle: view.includes("login") ? "Login" : "Register",
    hideChrome: true,
    bodyClass: "auth-body",
    mainClass: "auth-page",
    errorMessage: message,
    formValues: values,
  });
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const isApiPath = req.originalUrl && req.originalUrl.startsWith("/api");
    const respondJson = isApiPath && isJsonRequest(req) && !expectsHtml(req);

    if (respondJson) {
      return res.status(201).json({
        message: "User registered",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }

    return res.redirect("/login");
  } catch (err) {
    const isApiPath = req.originalUrl && req.originalUrl.startsWith("/api");
    const respondJson = isApiPath && isJsonRequest(req) && !expectsHtml(req);

    if (!respondJson) {
      return renderAuthPage(res, "pages/register", {
        status: err.status || err.statusCode || 400,
        message: err.message || "Registration failed",
        values: {
          name: req.body && req.body.name,
          email: req.body && req.body.email,
        },
      });
    }

    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(
      req.body.email,
      req.body.password
    );

    const isApiPath = req.originalUrl && req.originalUrl.startsWith("/api");
    const respondJson = isApiPath && isJsonRequest(req) && !expectsHtml(req);

    if (respondJson) {
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/");
  } catch (err) {
    const isApiPath = req.originalUrl && req.originalUrl.startsWith("/api");
    const respondJson = isApiPath && isJsonRequest(req) && !expectsHtml(req);

    if (!respondJson) {
      return renderAuthPage(res, "pages/login", {
        status: err.status || err.statusCode || 401,
        message: err.message || "Login failed",
        values: {
          email: req.body && req.body.email,
        },
      });
    }

    next(err);
  }
};

exports.logout = (req, res) => {
  const isApiPath = req.originalUrl && req.originalUrl.startsWith("/api");
  const respondJson = isApiPath && isJsonRequest(req) && !expectsHtml(req);
  res.clearCookie("token");

  if (respondJson) {
    return res.json({ message: "Logged out" });
  }

  return res.redirect("/");
};
