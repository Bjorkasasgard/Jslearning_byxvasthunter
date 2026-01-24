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

      if (!ticket) {
        const err = new Error("Tiket tidak ditemukan");
        err.status = 404;
        throw err;
      }
      if (ticket.quota < item.quantity) {
        const err = new Error(`Stok tiket tidak cukup. Sisa: ${ticket.quota}`);
        err.status = 400;
        throw err;
      }

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { quota: { decrement: item.quantity } },
      });

      // fetch event once and prepare snapshot values
      const event = ticket.eventId ? await tx.event.findUnique({ where: { id: ticket.eventId } }) : null;
      const snapshot = {
        ticketName: ticket.name || null,
        ticketPrice: typeof ticket.price === 'number' ? ticket.price : null,
        eventTitle: event ? event.title || null : null,
        eventDate: event ? event.date || null : null,
        eventLocation: event ? event.location || null : null,
      };

      // debug: log snapshot values to help identify why fields may be empty
      try {
        console.debug('[orderService] creating orderItem snapshot', {
          ticketId: ticket.id,
          ticketName: snapshot.ticketName,
          ticketPrice: snapshot.ticketPrice,
          eventId: ticket.eventId,
          eventTitle: snapshot.eventTitle,
          eventDate: snapshot.eventDate,
          eventLocation: snapshot.eventLocation,
        });
      } catch (e) {
        // ignore logging errors
      }

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          ticketId: ticket.id,
          quantity: item.quantity,
          // snapshot ticket/event details
          ...snapshot,
        },
      });
    }

    return order;
  });
};
