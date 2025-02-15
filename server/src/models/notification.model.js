import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["blood_request", "comment", "other"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        redirectUrl: {
            type: String, // URL to redirect the user
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed, // Additional data (e.g., bloodRequestId)
        },
        isRead: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
