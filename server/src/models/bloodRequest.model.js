import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bloodGroup: {
        type: String, 
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
            required: true 
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    message: {
        type: String
    },
    contactDetails: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending',
        required: true
    }, 
    address: {
        state: { 
            type: String, 
            required: true 
        },
        district: { 
            type: String, 
            required: true 
        },
        city: { 
            type: String, 
            required: true 
        }
    },
    volunteers: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        canShareDetails: {
          type: Boolean,
          default: true
        }
      }],
}, { timestamps: true });

export const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);