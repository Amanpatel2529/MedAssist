const axios = require('axios');

/**
 * Google Search Integration
 * Provides real-time medical information from Google
 */

/**
 * Search medical information using Google Custom Search API
 * Note: Requires GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env
 */
const searchMedicalInfo = async (query) => {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    // If API keys not configured, return empty results
    if (!apiKey || !searchEngineId) {
      console.warn('Google Search API keys not configured');
      return {
        success: false,
        results: [],
        message: 'Google Search not configured'
      };
    }

    const url = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      q: `medical ${query}`,
      key: apiKey,
      cx: searchEngineId,
      num: 3 // Get top 3 results
    };

    const response = await axios.get(url, { params });

    if (!response.data.items) {
      return {
        success: true,
        results: [],
        message: 'No results found'
      };
    }

    const results = response.data.items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: 'Google Search'
    }));

    return {
      success: true,
      results: results,
      message: 'Search completed successfully'
    };
  } catch (error) {
    console.error('Google Search Error:', error.message);
    return {
      success: false,
      results: [],
      error: error.message
    };
  }
};

/**
 * Format search results for inclusion in AI response
 */
const formatSearchResults = (searchResults) => {
  if (!searchResults.success || searchResults.results.length === 0) {
    return '';
  }

  const formattedResults = searchResults.results
    .map((result, index) => {
      return `${index + 1}. **${result.title}**\n   ${result.snippet}\n   [Read more](${result.link})`;
    })
    .join('\n\n');

  return `\n\n**Additional Information from Web Search:**\n${formattedResults}`;
};

/**
 * Get medical information from multiple sources
 */
const getMedicalInformation = async (query) => {
  try {
    const searchResults = await searchMedicalInfo(query);
    
    return {
      success: true,
      webResults: searchResults.results,
      formattedResults: formatSearchResults(searchResults)
    };
  } catch (error) {
    console.error('Error getting medical information:', error);
    return {
      success: false,
      webResults: [],
      formattedResults: ''
    };
  }
};

module.exports = {
  searchMedicalInfo,
  formatSearchResults,
  getMedicalInformation
};

