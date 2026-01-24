const prisma = require("../prisma/client");

exports.createEvent = (data) => {
  return prisma.event.create({ data });
};

exports.getAllEvents = () => {
  return prisma.event.findMany({
    orderBy: { date: "asc" },
  });
};

exports.getEventById = (id) => {
  return prisma.event.findUnique({
    where: { id: Number(id) },
  });
};

exports.updateEvent = (id, data) => {
  console.log('[service][event][updateEvent] id=', id, 'data=', data);
  const result = prisma.event.update({
    where: { id: Number(id) },
    data,
  });
  result.then((r) => console.log('[service][event][updateEvent] updated=', { id: r.id })).catch((e) => console.error('[service][event][updateEvent] error=', e && e.message));
  return result;
};

exports.deleteEvent = (id) => {
  return prisma.event.delete({
    where: { id: Number(id) },
  });
};
