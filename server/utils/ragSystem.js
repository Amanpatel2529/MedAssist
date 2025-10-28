const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * RAG (Retrieval-Augmented Generation) System
 * Parses MedAssist.pdf and provides context-aware medical information
 */

let medicalKnowledgeBase = [];
let isInitialized = false;

/**
 * Initialize the RAG system by parsing the PDF
 */
const initializeRAG = async () => {
  try {
    if (isInitialized && medicalKnowledgeBase.length > 0) {
      console.log('RAG system already initialized');
      return true;
    }

    const pdfPath = path.join(__dirname, '../../MedAssist.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.warn('MedAssist.pdf not found at', pdfPath);
      return false;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Extract text and split into chunks
    const fullText = pdfData.text;
    const chunks = splitTextIntoChunks(fullText, 500); // 500 character chunks
    
    medicalKnowledgeBase = chunks.map((chunk, index) => ({
      id: index,
      content: chunk,
      source: 'MedAssist.pdf'
    }));

    isInitialized = true;
    console.log(`RAG system initialized with ${medicalKnowledgeBase.length} chunks`);
    return true;
  } catch (error) {
    console.error('Error initializing RAG system:', error);
    return false;
  }
};

/**
 * Split text into chunks for better retrieval
 */
const splitTextIntoChunks = (text, chunkSize = 500) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Calculate similarity between two strings (simple approach)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.has(word)) matches++;
  });
  
  return matches / Math.max(words1.size, words2.size);
};

/**
 * Retrieve relevant chunks from knowledge base
 */
const retrieveRelevantContext = (query, topK = 3) => {
  if (!isInitialized || medicalKnowledgeBase.length === 0) {
    return [];
  }

  // Score all chunks based on similarity
  const scoredChunks = medicalKnowledgeBase.map(chunk => ({
    ...chunk,
    score: calculateSimilarity(query, chunk.content)
  }));

  // Sort by score and return top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(chunk => chunk.score > 0.1); // Only return relevant chunks
};

/**
 * Format context for Gemini API
 */
const formatContextForPrompt = (relevantChunks) => {
  if (relevantChunks.length === 0) {
    return '';
  }

  const contextText = relevantChunks
    .map(chunk => chunk.content)
    .join('\n\n---\n\n');

  return `Based on the MedAssist medical knowledge base:\n\n${contextText}\n\n`;
};

/**
 * Get augmented prompt with RAG context
 */
const getAugmentedPrompt = (userQuery) => {
  const relevantChunks = retrieveRelevantContext(userQuery, 3);
  const context = formatContextForPrompt(relevantChunks);
  
  return {
    augmentedPrompt: context,
    relevantChunks: relevantChunks,
    hasContext: relevantChunks.length > 0
  };
};

/**
 * Get knowledge base statistics
 */
const getKnowledgeBaseStats = () => {
  return {
    isInitialized,
    totalChunks: medicalKnowledgeBase.length,
    status: isInitialized ? 'Ready' : 'Not initialized'
  };
};

module.exports = {
  initializeRAG,
  retrieveRelevantContext,
  formatContextForPrompt,
  getAugmentedPrompt,
  getKnowledgeBaseStats,
  splitTextIntoChunks
};

