const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeIncident(description) {
  try {
    const prompt = `You are a cybersecurity incident analysis system.

Analyze the incident below and respond ONLY in valid JSON format. Do not include any other text, explanation, or markdown formatting.

JSON format:
{
  "incidentType": "string",
  "riskLevel": "LOW | MEDIUM | HIGH",
  "analysis": "string",
  "recommendation": "string"
}

Incident description:
${description}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const text = response.choices[0].message.content.trim();

    // Clean JSON if needed
    let cleanText = text.replace(/```json|```/g, '').trim();
    cleanText = cleanText.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, ''); // remove leading/trailing newlines

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', cleanText);
      // Try to extract JSON from text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Extraction failed:', e);
        }
      }
      return {
        incidentType: "Unknown",
        riskLevel: "MEDIUM",
        analysis: "Unable to analyze the incident automatically. Please review manually.",
        recommendation: "Contact security team for manual analysis."
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return {
      incidentType: "Unknown",
      riskLevel: "MEDIUM",
      analysis: "Unable to analyze the incident automatically due to API error. Please review manually.",
      recommendation: "Contact security team for manual analysis."
    };
  }
}

module.exports = { analyzeIncident };
