const eventService = require("../services/eventService");

exports.create = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
