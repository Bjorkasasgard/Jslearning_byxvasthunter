const prisma = require('../lib/prisma');
const { analyzeIncident } = require('../lib/openai');

exports.createIncident = async (req, res) => {
  try {
    const { description } = req.body;

    // Data Validation
    if (!description) {
      return res.status(400).render('incident/form', {
        error: 'Description is required'
      });
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      return res.status(400).render('incident/form', {
        error: 'Description must be at least 10 characters long'
      });
    }

    if (trimmedDescription.length > 2000) {
      return res.status(400).render('incident/form', {
        error: 'Description must not exceed 2000 characters'
      });
    }

    // Check for potentially harmful content (basic)
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(trimmedDescription)) {
        return res.status(400).render('incident/form', {
          error: 'Description contains potentially harmful content'
        });
      }
    }

    // openai
    const aiResult = await analyzeIncident(trimmedDescription);

    // Validate AI result
    if (!aiResult || !aiResult.incidentType || !aiResult.riskLevel || !aiResult.analysis) {
      console.error('Invalid AI result:', aiResult);
      return res.status(500).render('incident/form', {
        error: 'Failed to analyze incident. Please try again.'
      });
    }

    // utk save to db
    let incident;
    try {
      incident = await prisma.incidentReport.create({
        data: {
          description: trimmedDescription,
          incidentType: aiResult.incidentType,
          riskLevel: aiResult.riskLevel,
          analysis: aiResult.analysis,
          recommendation: aiResult.recommendation,
          userId: req.session.user.id
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).render('incident/form', {
        error: 'Failed to save incident. Please try again.'
      });
    }

    res.redirect(`/incident/result/${incident.id}`);

  } catch (err) {
    console.error('General error:', err);
    res.status(500).render('incident/form', {
      error: 'An unexpected error occurred. Please try again.'
    });
  }
};

exports.showResult = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incidentReport.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!incident) {
      return res.status(404).render('error', { message: 'Incident not found' });
    }

    res.render('incident/result', { incident });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};
