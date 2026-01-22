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
  return prisma.event.update({
    where: { id: Number(id) },
    data,
  });
};

exports.deleteEvent = (id) => {
  return prisma.event.delete({
    where: { id: Number(id) },
  });
};
