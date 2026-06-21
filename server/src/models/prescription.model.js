import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  extractedData: {
    medications: [medicationSchema],
    diagnosis: { type: String },
    doctorName: { type: String },
    date: { type: String },
    notes: { type: String }
  },
  rawText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

prescriptionSchema.index({ userId: 1, createdAt: -1 });

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
