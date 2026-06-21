import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ChatSession } from '../models/chatSession.model.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract topics and mood from a conversation using Gemini
 */
const metadataSchema = {
  type: SchemaType.OBJECT,
  properties: {
    topics: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    mood: { type: SchemaType.STRING }
  },
  required: ['topics', 'mood']
};

export const extractSessionMetadata = async (messages) => {
  try {
    if (!messages || messages.length === 0) {
      return { topics: [], mood: 'neutral' };
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: metadataSchema
      }
    });

    // Only use last 10 messages for efficiency
    const recentMessages = messages.slice(-10);
    const conversationText = recentMessages
      .map(m => `${m.role}: ${m.content.substring(0, 200)}`)
      .join('\n');

    const prompt = `Analyze this health conversation and extract metadata.

Conversation:
${conversationText}

Extract the specific medical/health topics discussed (max 5) and the overall mood (one of: anxious, concerned, neutral, positive, curious, distressed).`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      return JSON.parse(responseText.trim());
    } catch (parseError) {
      // Fallback extractor if there are stray characters
      const first = responseText.indexOf('{');
      const last = responseText.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        return JSON.parse(responseText.slice(first, last + 1));
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Error extracting session metadata:', error?.message || error);
    return { topics: [], mood: 'neutral' };
  }
};

/**
 * Analyze user behavior across all sessions
 */
export const analyzeUserBehavior = async (userId) => {
  try {
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select('metadata messages createdAt updatedAt title')
      .lean();

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        frequentTopics: [],
        moodDistribution: {},
        averageSessionLength: 0,
        recentActivity: [],
        consultationFrequency: 'none'
      };
    }

    // Aggregate topics
    const topicCounts = {};
    const moodCounts = {};
    let totalMessages = 0;

    sessions.forEach(session => {
      const msgCount = session.metadata?.messageCount || session.messages?.length || 0;
      totalMessages += msgCount;

      if (session.metadata?.topics) {
        session.metadata.topics.forEach(topic => {
          const normalized = topic.toLowerCase().trim();
          topicCounts[normalized] = (topicCounts[normalized] || 0) + 1;
        });
      }

      if (session.metadata?.mood) {
        const mood = session.metadata.mood.toLowerCase();
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    // Sort topics by frequency
    const frequentTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Calculate consultation frequency
    let consultationFrequency = 'low';
    if (sessions.length > 0) {
      const firstSession = new Date(sessions[sessions.length - 1].createdAt);
      const daysSinceFirst = Math.max(1, (Date.now() - firstSession) / (1000 * 60 * 60 * 24));
      const sessionsPerWeek = (sessions.length / daysSinceFirst) * 7;
      
      if (sessionsPerWeek >= 5) consultationFrequency = 'very high';
      else if (sessionsPerWeek >= 3) consultationFrequency = 'high';
      else if (sessionsPerWeek >= 1) consultationFrequency = 'moderate';
      else consultationFrequency = 'low';
    }

    // Recent activity (last 5 sessions)
    const recentActivity = sessions.slice(0, 5).map(s => ({
      title: s.title,
      date: s.updatedAt,
      messageCount: s.metadata?.messageCount || s.messages?.length || 0,
      mood: s.metadata?.mood || 'neutral',
      topics: s.metadata?.topics || []
    }));

    return {
      totalSessions: sessions.length,
      totalMessages,
      frequentTopics,
      moodDistribution: moodCounts,
      averageSessionLength: Math.round(totalMessages / sessions.length),
      recentActivity,
      consultationFrequency
    };
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    return {
      totalSessions: 0,
      totalMessages: 0,
      frequentTopics: [],
      moodDistribution: {},
      averageSessionLength: 0,
      recentActivity: [],
      consultationFrequency: 'none'
    };
  }
};

/**
 * Generate a title for a session based on the first user message
 */
export const generateSessionTitle = async (firstMessage) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 30,
        temperature: 0.3,
      }
    });

    const prompt = `Generate a very short title (3-6 words max) for a health chat that starts with this message. Return ONLY the title text, nothing else.

Message: "${firstMessage.substring(0, 200)}"`;

    const result = await model.generateContent(prompt);
    const title = result.response.text().trim().replace(/^["']|["']$/g, '');
    return title.substring(0, 60);
  } catch (error) {
    console.error('Error generating session title:', error);
    return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
  }
};
