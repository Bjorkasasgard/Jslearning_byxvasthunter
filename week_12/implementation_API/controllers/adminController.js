const prisma = require('../lib/prisma');

exports.viewIncidents = async (req, res) => {
  const incidents = await prisma.incidentReport.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.render('admin/incidents', { incidents });
};
