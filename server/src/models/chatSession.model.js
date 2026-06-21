import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  originalName: {
    type: String
  },
  analysis: {
    type: String
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [attachmentSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  metadata: {
    topics: [String],
    mood: {
      type: String,
      default: 'neutral'
    },
    messageCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ userId: 1, updatedAt: -1 });

// Static method to enforce session cap (20 per user)
chatSessionSchema.statics.enforceSessionCap = async function(userId, maxSessions = 20) {
  const sessionCount = await this.countDocuments({ userId });
  if (sessionCount >= maxSessions) {
    // Delete oldest sessions beyond the cap
    const sessionsToDelete = await this.find({ userId })
      .sort({ updatedAt: 1 })
      .limit(sessionCount - maxSessions + 1)
      .select('_id');
    
    const idsToDelete = sessionsToDelete.map(s => s._id);
    await this.deleteMany({ _id: { $in: idsToDelete } });
    return idsToDelete; // Return deleted IDs so we can clean up Pinecone
  }
  return [];
};

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
