const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';

async function getCyberSecurityNews() {
  // Construct the URL for the NewsAPI
  const query = 'cybersecurity OR "information security" OR malware OR phishing OR hacking';
  const url = `${NEWS_API_ENDPOINT}?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Log the error for debugging but don't block the UI
      console.error(`NewsAPI request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Check for API errors in the response body
    if (data.status === 'error') {
      console.error(`NewsAPI Error: ${data.message}`);
      return [];
    }

    return data.articles || [];

  } catch (error) {
    console.error('Failed to fetch cybersecurity news:', error);
    // Return an empty array on any exception to ensure the page still renders
    return [];
  }
}

module.exports = { getCyberSecurityNews };
