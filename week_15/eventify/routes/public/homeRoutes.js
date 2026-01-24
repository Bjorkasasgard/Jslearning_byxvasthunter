const router = require("express").Router();
const prisma = require("../../prisma/client");
const authController = require("../../controllers/authController");
const authValidations = require("../../validations/authValidations");

const renderAuthPage = (res, view, options = {}) => {
  const { message = null, values = {} } = options;

  return res.status(400).render(view, {
    pageTitle: view.includes("login") ? "Login" : "Register",
    hideChrome: true,
    bodyClass: "auth-body",
    mainClass: "auth-page",
    errorMessage: message,
    formValues: values,
  });
};

const validateAuthForm = (schema, view, mapValues) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: true, allowUnknown: true, stripUnknown: true });
  if (error) {
    return renderAuthPage(res, view, {
      message: error.details[0].message,
      values: mapValues ? mapValues(req.body) : req.body,
    });
  }
  return next();
};

router.get("/", async (req, res, next) => {
  try {
    const q = (typeof req.query.q === "string" ? req.query.q : "").trim();

    const eventsRaw = await prisma.event.findMany({
      orderBy: { date: "asc" },
      where: q
        ? {
            OR: [
              { title: { contains: q } },
              { location: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : undefined,
      include: {
        tickets: true,
        createdBy: {
          select: {
            name: true,
            email: true,
            avatarData: true,
            avatarMime: true,
          },
        },
      },
    });

    const events = eventsRaw.map((event) => {
      const prices = (event.tickets || [])
        .map((t) => t.price)
        .filter((p) => typeof p === "number");

      const minPrice = prices.length ? Math.min(...prices) : null;

      const creator = event.createdBy;
      const creatorAvatar = creator && creator.avatarData
        ? `data:${creator.avatarMime || "image/png"};base64,${Buffer.from(creator.avatarData).toString("base64")}`
        : null;

      const imageSrc = event.imageData
        ? `data:${event.imageMime || "image/jpeg"};base64,${Buffer.from(event.imageData).toString("base64")}`
        : null;

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        minPrice,
        imageSrc,
        creatorName: creator ? creator.name || creator.email : null,
        creatorAvatar,
      };
    });

    res.render("pages/home", { events });
  } catch (err) {
    next(err);
  }
});

router.get("/login", (req, res) => {
  res.render("pages/login", {
    pageTitle: "Login",
    hideChrome: true,
    bodyClass: "auth-body",
    mainClass: "auth-page",
  });
});

router.post(
  "/login",
  validateAuthForm(authValidations.login, "pages/login", (body) => ({
    email: body && body.email,
  })),
  authController.login
);

router.get("/register", (req, res) => {
  res.render("pages/register", {
    pageTitle: "Register",
    hideChrome: true,
    bodyClass: "auth-body",
    mainClass: "auth-page",
  });
});

router.post(
  "/register",
  validateAuthForm(authValidations.register, "pages/register", (body) => ({
    name: body && body.name,
    email: body && body.email,
  })),
  authController.register
);

router.get("/event/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }

    const tickets = await prisma.ticket.findMany({
      where: { eventId: event.id },
    });

    const imageSrc = event.imageData
      ? `data:${event.imageMime || "image/jpeg"};base64,${Buffer.from(event.imageData).toString("base64")}`
      : null;

    const eventView = {
      ...event,
      imageSrc,
      organizer: event.createdBy ? event.createdBy.name || event.createdBy.email : event.organizer,
    };

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.render("pages/eventDetail", {
      event: eventView,
      tickets,
      errorMessage: req.query && req.query.error ? req.query.error : null,
      isAdmin: res.locals.isAdmin,
      isAuthenticated: res.locals.isAuthenticated,
      baseUrl,
      currentPath: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
