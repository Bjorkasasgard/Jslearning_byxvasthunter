const prisma = require("../prisma/client");


exports.createTicket = (data) => {
  return prisma.ticket.create({ data });
};

exports.getTicketsByEvent = (eventId) => {
  return prisma.ticket.findMany({
    where: { eventId: Number(eventId) },
  });
};

exports.getTicketById = (id) => {
  return prisma.ticket.findUnique({ where: { id: Number(id) } });
};

exports.updateTicket = (id, data) => {
  return prisma.ticket.update({ where: { id: Number(id) }, data });
};

exports.deleteTicket = async (id) => {
  const ticketId = Number(id);
  const related = await prisma.orderItem.count({ where: { ticketId } });
  if (related > 0) {
    const err = new Error('Tidak dapat menghapus tiket karena sudah ada pesanan terkait. Silakan nonaktifkan tiket atau atur kuota menjadi 0.');
    err.status = 400;
    throw err;
  }

  return prisma.ticket.delete({ where: { id: ticketId } });
};
