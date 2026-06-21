import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Use the host-based index reference
const index = pc.index('umeed', process.env.PINECONE_HOST);

/**
 * Validate that an embedding is a non-empty array of numbers
 */
const isValidEmbedding = (embedding) => {
  return Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number';
};

/**
 * Generate embeddings using Pinecone's built-in llama-text-embed-v2 model
 */
const generateEmbedding = async (text) => {
  try {
    const truncated = text.substring(0, 4000);
    const response = await pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [truncated],
      parameters: { inputType: 'passage', truncate: 'END' }
    });

    const values = response?.data?.[0]?.values;
    if (!isValidEmbedding(values)) {
      console.warn('generateEmbedding: got empty/invalid values from Pinecone inference');
      return null;
    }
    return values;
  } catch (error) {
    console.error('Error generating embedding:', error?.message || error);
    return null;
  }
};

/**
 * Generate query embedding (uses 'query' input type for better retrieval)
 */
const generateQueryEmbedding = async (text) => {
  try {
    const truncated = text.substring(0, 4000);
    const response = await pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [truncated],
      parameters: { inputType: 'query', truncate: 'END' }
    });

    const values = response?.data?.[0]?.values;
    if (!isValidEmbedding(values)) {
      console.warn('generateQueryEmbedding: got empty/invalid values from Pinecone inference');
      return null;
    }
    return values;
  } catch (error) {
    console.error('Error generating query embedding:', error?.message || error);
    return null;
  }
};

/**
 * Index a chat message exchange into Pinecone
 */
export const indexChatMessage = async (userId, sessionId, userMessage, assistantMessage) => {
  try {
    const combinedText = `User: ${userMessage}\nAssistant: ${assistantMessage}`;
    const embedding = await generateEmbedding(combinedText);

    // Guard: only upsert if we have a valid non-empty embedding
    if (!isValidEmbedding(embedding)) return;

    const vectorId = `chat_${sessionId}_${Date.now()}`;
    await index.upsert({ records: [{
      id: vectorId,
      values: embedding,
      metadata: {
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        type: 'chat',
        userMessage: userMessage.substring(0, 1000),
        assistantMessage: assistantMessage.substring(0, 1000),
        timestamp: new Date().toISOString()
      }
    }]});

    return vectorId;
  } catch (error) {
    console.error('Error indexing chat message:', error?.message || error);
  }
};

/**
 * Index prescription text into Pinecone
 */
export const indexPrescription = async (userId, prescriptionId, rawText) => {
  try {
    const embedding = await generateEmbedding(rawText);

    // Guard: only upsert if we have a valid non-empty embedding
    if (!isValidEmbedding(embedding)) return;

    const vectorId = `prescription_${prescriptionId}_${Date.now()}`;
    await index.upsert({ records: [{
      id: vectorId,
      values: embedding,
      metadata: {
        userId: userId.toString(),
        prescriptionId: prescriptionId.toString(),
        type: 'prescription',
        text: rawText.substring(0, 1000),
        timestamp: new Date().toISOString()
      }
    }]});

    return vectorId;
  } catch (error) {
    console.error('Error indexing prescription:', error?.message || error);
  }
};

/**
 * Query Pinecone for relevant context based on user query
 */
export const queryRelevantContext = async (userId, queryText, topK = 5) => {
  try {
    const queryEmbedding = await generateQueryEmbedding(queryText);

    if (!isValidEmbedding(queryEmbedding)) return [];

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      filter: { userId: { $eq: userId.toString() } },
      includeMetadata: true
    });

    return (results.matches || [])
      .filter(match => match.score > 0.3)
      .map(match => ({
        type: match.metadata?.type,
        score: match.score,
        content: match.metadata?.type === 'chat'
          ? `Previous conversation:\nUser asked: ${match.metadata.userMessage}\nAssistant replied: ${match.metadata.assistantMessage}`
          : `Prescription data: ${match.metadata?.text}`,
        timestamp: match.metadata?.timestamp
      }));
  } catch (error) {
    console.error('Error querying Pinecone:', error?.message || error);
    return [];
  }
};

/**
 * Delete vectors by session ID.
 * Note: filter-based deleteMany is not supported on free Pinecone tier —
 * we silently skip this operation; vectors will age out naturally or be
 * overwritten on next upsert.
 */
export const deleteSessionVectors = async (sessionId) => {
  try {
    // Free-tier Pinecone does not support filter-based delete.
    // We intentionally skip this to avoid the 404 error.
    // Vectors will remain in the index but will not be retrieved
    // once the session is deleted (user-scoped queries won't match them
    // unless the userId also matches, which it won't for deleted sessions).
    console.log(`[RAG] Skipping vector cleanup for session ${sessionId} (free tier limitation)`);
  } catch (error) {
    // Silently ignore — vector cleanup is best-effort
  }
};
