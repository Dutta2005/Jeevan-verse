import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// Helper function to convert chat history
const formatChatHistory = (context) => {
  if (!Array.isArray(context)) return [];
  
  return context.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
};



const createMedicalPrompt = (userMessage, user) => {
  const { bloodGroup, height, weight } = user?.info || {};
  
  // Calculate BMI if height and weight are available
  let bmi;
  if (height && weight) {
    // Convert height to meters if in cm
    const heightInMeters = height > 3 ? height / 100 : height;
    bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  // console.log('User Profile:', user);

  const userProfile = `
User Health Profile:
${bloodGroup ? `- Blood Group: ${bloodGroup}` : '- Blood Group: Not provided'}
${height ? `- Height: ${height}cm` : '- Height: Not provided'}
${weight ? `- Weight: ${weight}kg` : '- Weight: Not provided'}
${bmi ? `- BMI: ${bmi}` : ''}`;

  const systemPrompt = `You are a medical assistant AI. Consider the user's health profile while providing advice:
${userProfile}

Provide:
1. Information about possible conditions based on symptoms, considering the user's health metrics
2. General medical information and advice considering the user's health metrics if applicable
3. Specific home remedies suitable for their body type and condition
4. Discuss medications, their uses, and effects when asked, noting any specific considerations based on their health profile
5. Blood group specific dietary and lifestyle recommendations when asked
6. BMI-specific health considerations and advice when asked

Keep responses:
- Direct and clear
- Using clinical terms for sensitive topics
- Educational without making diagnoses
- Professional but easy to understand
- Considerate of the user's specific health metrics
- If you can't provide a response, let the user know

Add a brief reminder about consulting a doctor.`;

  return `${systemPrompt}\n\nUser Query: ${userMessage}`;
};

// Process chat message
export const processChat = async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    const user = req.user;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const chat = model.startChat({
          history: formatChatHistory(context)
        });

        const prompt = createMedicalPrompt(message, user);
        const result = await chat.sendMessage([{ text: prompt }]);
        
        if (!result.response) {
          throw new Error('No response received');
        }

        const responseText = result.response.text();
        const finalResponse = `${responseText}\n\nPlease consult a healthcare provider for proper medical advice.`;

        return res.json({
          message: finalResponse,
          context: [
            ...context,
            { role: "user", content: message },
            { role: "assistant", content: finalResponse }
          ]
        });

      } catch (chatError) {
        console.error(`Attempt ${attempts + 1} failed:`, chatError);
        
        if (chatError.message?.includes('SAFETY')) {
          attempts++;
          
          if (attempts === maxAttempts) {
            return res.status(400).json({
              message: 'Please rephrase your question using medical terminology for a more detailed response.'
            });
          }
          continue;
        }
        
        throw chatError;
      }
    }

  } catch (error) {
    console.error('Error in processChat:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: 'Please try asking your question differently.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};