import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// Mark a single notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        if (!mongoose.isObjectIdOrHexString(notificationId)) {
            return res.status(400).json(new ApiResponse(400, "Invalid notification ID"));
        }
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: req.user._id },
            { $set: { isRead: true } },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json(new ApiResponse(404, "Notification not found"));
        }

        return res.status(200).json(
            new ApiResponse(200, "Notification marked as read", notification)
        );
    } catch {
        return res.status(500).json(
            new ApiResponse(500, "Something went wrong while marking notification as read")
        );
    }
});

// Mark all notifications as read for a user
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json(
            new ApiResponse(200, "All notifications marked as read", result)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while marking all notifications as read")
        );
    }
});

// Get all notifications for a user
const getAllNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, "Notifications fetched successfully", notifications)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching notifications")
        );
    }
});

// Delete a single notification
const deleteNotification = asyncHandler(async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.isObjectIdOrHexString(notificationId)) {
            return res.status(400).json(new ApiResponse(400, "Invalid notification ID"));
        }
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: req.user._id,
        });
        if (!notification) {
            return res.status(404).json(new ApiResponse(404, "Notification not found"));
        }

        return res.status(200).json(
            new ApiResponse(200, "Notification deleted successfully", notification)
        );
    } catch {
        return res.status(500).json(
            new ApiResponse(500, "Something went wrong while deleting notification")
        );
    }
});

// Delete all notifications for a user
const deleteAllNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Notification.deleteMany({ userId });

        return res.status(200).json(
            new ApiResponse(200, "All notifications deleted successfully", result)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while deleting all notifications")
        );
    }
});

// Get notifications after a specific timestamp
const getNotificationsAfterTime = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { time } = req.query;

        if (!time) {
            throw new ApiError(400, "Timestamp is required");
        }

        const timestamp = new Date(time);
        if (isNaN(timestamp.getTime())) {
            throw new ApiError(400, "Invalid timestamp format");
        }

        const notifications = await Notification.find({
            userId,
            createdAt: { $gt: timestamp }
        }).sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, "Filtered notifications fetched successfully", notifications)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching notifications")
        );
    }
});

export {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getAllNotifications,
    deleteNotification,
    deleteAllNotifications,
    getNotificationsAfterTime
};
