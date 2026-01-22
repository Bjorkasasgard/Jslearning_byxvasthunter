const ticketService = require("../services/ticketService");

exports.create = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.getByEvent = async (req, res, next) => {
  try {
    const tickets = await ticketService.getTicketsByEvent(req.params.eventId);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};
