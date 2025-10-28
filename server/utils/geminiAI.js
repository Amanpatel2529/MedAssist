const { getGeminiModel } = require("../config/gemini");
const { getAugmentedPrompt, initializeRAG } = require("./ragSystem");
const { getMedicalInformation } = require("./googleSearch");

const MEDICAL_SYSTEM_PROMPT = `You are an advanced medical AI assistant designed to help doctors, patients, and medical students.
Your role is to:
1. Provide accurate medical information about symptoms, diseases, and treatments
2. Help patients understand their health conditions
3. Assist medical students in learning about diseases and treatments
4. Support doctors in patient consultations
5. Suggest appropriate medical interventions and precautions
6. Identify critical conditions that require immediate expert consultation

IMPORTANT GUIDELINES:
- Always emphasize that you are an AI assistant and not a substitute for professional medical advice
- For critical symptoms (chest pain, severe bleeding, difficulty breathing, etc.), immediately suggest contacting emergency services
- Provide evidence-based medical information
- Ask clarifying questions to better understand the patient's condition
- Suggest lifestyle modifications and preventive measures
- If a condition seems critical or beyond your scope, recommend consulting with a specialist doctor
- Be empathetic and supportive in your responses
- Maintain patient privacy and confidentiality`;

/**
 * Transforms the raw conversation history (from the database) into the format required by the Gemini API.
 * @param {Array<Object>} history The raw message objects, assumed to have sender_type and message_text.
 * @returns {Array<Object>} The transformed history with 'role' and 'parts'.
 */
const transformHistoryForGemini = (history) => {
  return history.map((msg) => {
    // Map database sender_type to Gemini API role
    let role = "user"; // Default to user for safety
    if (
      msg.sender_type &&
      (msg.sender_type === "ai" || msg.sender_type === "model")
    ) {
      role = "model";
    } else if (msg.sender_type) {
      // Treat all human types (user, patient, doctor) as 'user' for the API
      role = "user";
    }

    // Ensure parts array is constructed correctly
    return {
      role: role,
      parts: [{ text: msg.message_text }],
    };
  });
};

const generateMedicalResponse = async (
  userMessage,
  conversationHistory = []
) => {
  try {
    // Initialize RAG system on first call
    await initializeRAG();

    const model = getGeminiModel();

    // Get RAG context from MedAssist.pdf
    const ragContext = getAugmentedPrompt(userMessage);

    // Get web search results
    const webResults = await getMedicalInformation(userMessage);

    // Transform the incoming database history
    const transformedHistory = transformHistoryForGemini(conversationHistory);

    // Build augmented system prompt with RAG context
    let augmentedSystemPrompt = MEDICAL_SYSTEM_PROMPT;
    if (ragContext.hasContext) {
      augmentedSystemPrompt += `\n\nRELEVANT MEDICAL KNOWLEDGE:\n${ragContext.augmentedPrompt}`;
    }

    const messages = [
      {
        role: "user",
        parts: [{ text: augmentedSystemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I will provide helpful medical information while emphasizing the importance of professional medical consultation.",
          },
        ],
      },
      ...transformedHistory,
    ];

    const chat = model.startChat({
      history: messages,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    let text = response.text();

    // Append web search results if available
    if (webResults.success && webResults.webResults.length > 0) {
      text += webResults.formattedResults;
    }

    return {
      success: true,
      response: text,
      isCritical: detectCriticalCondition(text),
      hasRAGContext: ragContext.hasContext,
      hasWebResults: webResults.success && webResults.webResults.length > 0,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const detectCriticalCondition = (responseText) => {
  const criticalKeywords = [
    "emergency",
    "critical",
    "severe",
    "immediately",
    "call ambulance",
    "emergency services",
    "life-threatening",
    "urgent",
    "hospital",
    "ICU",
    "cardiac",
    "stroke",
    "severe bleeding",
    "difficulty breathing",
    "chest pain",
    "loss of consciousness",
  ];

  const lowerText = responseText.toLowerCase();
  return criticalKeywords.some((keyword) => lowerText.includes(keyword));
};

const generateMedicineRecommendation = async (
  symptoms,
  medicalHistory = ""
) => {
  try {
    const prompt = `Based on the following symptoms and medical history, suggest appropriate medicines and precautions:
    
Symptoms: ${symptoms}
Medical History: ${medicalHistory || "None provided"}

Please provide:
1. Possible conditions
2. Recommended medicines (generic names)
3. Dosage suggestions (general guidelines)
4. Precautions and side effects
5. When to seek emergency care

Remember: This is for informational purposes only and should be reviewed by a qualified doctor.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
      success: true,
      recommendation: response.text(),
    };
  } catch (error) {
    console.error("Error generating medicine recommendation:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const generateLearningContent = async (topic) => {
  try {
    const prompt = `Create comprehensive educational content for medical students about: ${topic}

Include:
1. Definition and overview
2. Pathophysiology
3. Clinical presentation
4. Diagnosis methods
5. Treatment options
6. Complications
7. Prevention strategies
8. Recent research highlights

Format the response in a clear, structured manner suitable for medical education.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
      success: true,
      content: response.text(),
    };
  } catch (error) {
    console.error("Error generating learning content:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  generateMedicalResponse,
  detectCriticalCondition,
  generateMedicineRecommendation,
  generateLearningContent,
};
