const prisma = require('../lib/prisma');
const { getCyberSecurityNews } = require('../lib/news');

exports.index = async (req, res) => {
  const user = req.session.user;

  // Fetch stats and news in parallel
  const [stats, articles] = await Promise.all([
    getIncidentStats(user),
    getCyberSecurityNews()
  ]);

  res.render('dashboard', {
    user,
    stats,
    articles
  });
};

async function getIncidentStats(user) {
  if (user.role === 'ADMIN') {
    const total = await prisma.incidentReport.count();
    const highRisk = await prisma.incidentReport.count({ where: { riskLevel: 'HIGH' } });
    const resolved = await prisma.incidentReport.count({ where: { riskLevel: 'LOW' } });
    return { total, underAnalysis: highRisk, resolved };
  } else {
    const whereClause = { where: { userId: user.id } };
    const total = await prisma.incidentReport.count(whereClause);
    const underAnalysis = await prisma.incidentReport.count({
      where: { userId: user.id, riskLevel: { not: 'LOW' } }
    });
    const resolved = await prisma.incidentReport.count({
      where: { userId: user.id, riskLevel: 'LOW' }
    });
    return { total, underAnalysis, resolved };
  }
}
