const prisma = require("../prisma/client");
const crypto = require("crypto");

exports.createOrder = async (userId, items) => {
  return prisma.$transaction(async (tx) => {
    const qrToken = crypto.randomBytes(16).toString("hex");

    const order = await tx.order.create({
      data: { userId, status: "UNPAID", qrToken },
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
