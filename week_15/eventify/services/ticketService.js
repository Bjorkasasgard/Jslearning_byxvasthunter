const prisma = require("../prisma/client");

exports.createTicket = (data) => {
  return prisma.ticket.create({ data });
};

exports.getTicketsByEvent = (eventId) => {
  return prisma.ticket.findMany({
    where: { eventId: Number(eventId) },
  });
};
