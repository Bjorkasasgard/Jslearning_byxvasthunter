const prisma = require("../prisma/client");

exports.createOrder = async (userId, items) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { userId },
    });

    for (const item of items) {
      const ticket = await tx.ticket.findUnique({
        where: { id: item.ticketId },
      });

      if (!ticket || ticket.quota < item.quantity) {
        const err = new Error("Ticket quota not sufficient");
        err.status = 400;
        throw err;
      }

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { quota: { decrement: item.quantity } },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          ticketId: ticket.id,
          quantity: item.quantity,
        },
      });
    }

    return order;
  });
};
