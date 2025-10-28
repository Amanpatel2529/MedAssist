const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });
};

module.exports = {
  genAI,
  getGeminiModel,
};

