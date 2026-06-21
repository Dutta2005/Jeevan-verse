import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatSession } from '../models/chatSession.model.js';
import { Prescription } from '../models/prescription.model.js';
import { indexChatMessage, indexPrescription, queryRelevantContext, deleteSessionVectors } from '../service/rag.service.js';
import { analyzePrescriptionImage, analyzePrescriptionPDF, uploadPrescriptionFile, formatPrescriptionSummary } from '../service/prescription.service.js';
import { extractSessionMetadata, analyzeUserBehavior, generateSessionTitle } from '../service/behavior.service.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MAX_SESSIONS_PER_USER = 20;

// ─── Helper: Build augmented system prompt ───────────────────────────────
const buildSystemPrompt = (user, ragContext = []) => {
  const { bloodGroup, height, weight } = user?.info || {};

  let bmi;
  if (height && weight) {
    const heightInMeters = height > 3 ? height / 100 : height;
    bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  let prompt = `You are Umeed, a compassionate and knowledgeable AI health assistant. You provide thoughtful, personalized health guidance while maintaining a warm, empathetic tone.

## User Health Profile
- Name: ${user?.name || 'User'}
- Age: ${user?.age || 'Not provided'}
${bloodGroup ? `- Blood Group: ${bloodGroup}` : '- Blood Group: Not provided'}
${height ? `- Height: ${height}cm` : '- Height: Not provided'}
${weight ? `- Weight: ${weight}kg` : '- Weight: Not provided'}
${bmi ? `- BMI: ${bmi}` : ''}

## Your Capabilities
1. Analyze symptoms and provide information about possible conditions, considering the user's health profile
2. Provide personalized health advice based on their body metrics
3. Discuss medications, their uses, side effects, and interactions
4. Recommend home remedies suitable for their body type
5. Provide blood group specific dietary and lifestyle recommendations
6. Analyze uploaded prescriptions and explain medications
7. Remember and reference past conversations and prescriptions

## Guidelines
- Be direct, clear, and professional but warm
- Use clinical terms when appropriate
- Never diagnose — always educate
- Consider the user's specific health metrics in your advice
- When referencing past prescriptions or conversations, be specific
- Always add a brief reminder about consulting a healthcare provider`;

  // Add RAG context if available
  if (ragContext.length > 0) {
    prompt += '\n\n## Relevant Context from Past Interactions\n';
    prompt += 'Use this information to provide personalized, context-aware responses:\n\n';
    ragContext.forEach((ctx, i) => {
      prompt += `${i + 1}. [${ctx.type}] ${ctx.content}\n\n`;
    });
  }

  return prompt;
};

// ─── Helper: Format chat history for Gemini ──────────────────────────────
const formatChatHistory = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  // Take last 20 messages to stay within context limits
  const recent = messages.slice(-20);

  return recent.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
};

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /chat/sessions — List all sessions for the authenticated user
 */
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title metadata isActive createdAt updatedAt')
    .lean();

  res.json(new ApiResponse(200, 'Sessions retrieved', sessions));
});

/**
 * POST /chat/sessions — Create a new chat session
 */
export const createSession = asyncHandler(async (req, res) => {
  // Enforce session cap
  const deletedIds = await ChatSession.enforceSessionCap(req.user._id, MAX_SESSIONS_PER_USER);

  // Clean up Pinecone vectors for deleted sessions (async, non-blocking)
  deletedIds.forEach(id => deleteSessionVectors(id).catch(console.error));

  const session = await ChatSession.create({
    userId: req.user._id,
    title: 'New Conversation',
    messages: [],
    metadata: { topics: [], mood: 'neutral', messageCount: 0 }
  });

  res.status(201).json(new ApiResponse(201, 'Session created', session));
});

/**
 * GET /chat/sessions/:sessionId — Get a full session with messages
 */
export const getSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.sessionId,
    userId: req.user._id
  }).lean();

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  res.json(new ApiResponse(200, 'Session retrieved', session));
});

/**
 * DELETE /chat/sessions/:sessionId — Delete a session
 */
export const deleteSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndDelete({
    _id: req.params.sessionId,
    userId: req.user._id
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Clean up Pinecone vectors (async)
  deleteSessionVectors(req.params.sessionId).catch(console.error);

  // Clean up associated prescriptions
  await Prescription.deleteMany({ sessionId: req.params.sessionId });

  res.json(new ApiResponse(200, 'Session deleted'));
});

/**
 * POST /chat/sessions/:sessionId/message — Send a message with RAG
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { sessionId } = req.params;
  const user = req.user;

  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  // Find the session
  const session = await ChatSession.findOne({
    _id: sessionId,
    userId: user._id
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // 1. Query Pinecone for relevant context
  const ragContext = await queryRelevantContext(user._id.toString(), message);

  // 2. Build augmented prompt
  const systemPrompt = buildSystemPrompt(user, ragContext);

  // 3. Set up Gemini
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 0.85,
      topK: 40,
    },
    systemInstruction: systemPrompt
  });

  // 4. Send to Gemini with conversation history
  let attempts = 0;
  const maxAttempts = 2;
  let responseText = '';

  while (attempts < maxAttempts) {
    try {
      const chat = model.startChat({
        history: formatChatHistory(session.messages)
      });

      const result = await chat.sendMessage([{ text: message }]);

      if (!result.response) {
        throw new Error('No response received');
      }

      responseText = result.response.text();
      break;
    } catch (chatError) {
      console.error(`Attempt ${attempts + 1} failed:`, chatError);

      if (chatError.message?.includes('SAFETY')) {
        attempts++;
        if (attempts === maxAttempts) {
          responseText = 'I understand your concern. Could you please rephrase your question using medical terminology? This helps me provide more accurate information.';
        }
        continue;
      }
      throw chatError;
    }
  }

  // 5. Save messages to session
  const userMsg = { role: 'user', content: message, timestamp: new Date() };
  const assistantMsg = { role: 'assistant', content: responseText, timestamp: new Date() };

  session.messages.push(userMsg, assistantMsg);
  session.metadata.messageCount = session.messages.length;

  // Generate title if this is the first message
  if (session.messages.length <= 2) {
    session.title = await generateSessionTitle(message);
  }

  await session.save();

  // 6. Index in Pinecone (async, non-blocking)
  indexChatMessage(user._id.toString(), sessionId, message, responseText).catch(console.error);

  // 7. Update session metadata periodically (every 5 messages)
  if (session.messages.length % 5 === 0) {
    extractSessionMetadata(session.messages)
      .then(meta => {
        ChatSession.updateOne(
          { _id: sessionId },
          { $set: { 'metadata.topics': meta.topics, 'metadata.mood': meta.mood } }
        ).catch(console.error);
      })
      .catch(console.error);
  }

  res.json(new ApiResponse(200, 'Message sent', {
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    sessionTitle: session.title
  }));
});

/**
 * POST /chat/sessions/:sessionId/upload — Upload and analyze a prescription
 */
export const uploadPrescription = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const user = req.user;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Validate session
  const session = await ChatSession.findOne({
    _id: sessionId,
    userId: user._id
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Determine file type
  const mimeType = file.mimetype;
  const isPDF = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');

  if (!isPDF && !isImage) {
    throw new ApiError(400, 'Only images (jpg, png, webp) and PDFs are supported');
  }

  const fileType = isPDF ? 'pdf' : 'image';

  // 1. Upload to Cloudinary
  const uploadResult = await uploadPrescriptionFile(file.buffer, fileType);

  // 2. Analyze with Gemini
  let analysis;
  if (isPDF) {
    analysis = await analyzePrescriptionPDF(file.buffer);
  } else {
    analysis = await analyzePrescriptionImage(file.buffer, mimeType);
  }

  // 3. Save prescription to DB
  const rawText = analysis._rawText || formatPrescriptionSummary(analysis);
  delete analysis._rawText;

  const prescription = await Prescription.create({
    userId: user._id,
    sessionId,
    originalUrl: uploadResult.secure_url,
    fileType,
    extractedData: analysis,
    rawText
  });

  // 4. Generate chat summary
  const summaryText = formatPrescriptionSummary(analysis);

  // 5. Add messages to session
  const userMsg = {
    role: 'user',
    content: `I've uploaded a prescription for analysis.`,
    attachments: [{
      type: fileType,
      url: uploadResult.secure_url,
      originalName: file.originalname,
      analysis: JSON.stringify(analysis)
    }],
    timestamp: new Date()
  };

  const assistantMsg = {
    role: 'assistant',
    content: summaryText,
    timestamp: new Date()
  };

  session.messages.push(userMsg, assistantMsg);
  session.metadata.messageCount = session.messages.length;

  if (session.messages.length <= 2) {
    session.title = 'Prescription Analysis';
  }

  await session.save();

  // 6. Index prescription in Pinecone (async)
  indexPrescription(user._id.toString(), prescription._id.toString(), rawText).catch(console.error);

  res.json(new ApiResponse(200, 'Prescription analyzed', {
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    prescription: {
      id: prescription._id,
      url: uploadResult.secure_url,
      analysis
    },
    sessionTitle: session.title
  }));
});

/**
 * GET /chat/behavior — Get user behavior insights
 */
export const getBehaviorInsights = asyncHandler(async (req, res) => {
  const insights = await analyzeUserBehavior(req.user._id);
  res.json(new ApiResponse(200, 'Behavior insights retrieved', insights));
});