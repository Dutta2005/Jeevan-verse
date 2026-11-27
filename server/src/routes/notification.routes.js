import express from "express";
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getAllNotifications,
    deleteNotification,
    deleteAllNotifications,
    getNotificationsAfterTime,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";

const router = express.Router();

// Routes for notifications
router.use(verifyJWT);
router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    const expectedAccount = req.get("X-Notification-Account");
    if (expectedAccount !== undefined && expectedAccount !== req.user._id.toString()) {
        return res.status(403).json(new ApiResponse(403, "Notification account changed"));
    }
    next();
});

// /api/v1/notifications

router.get("/", getAllNotifications);
router.patch("/mark-read/:notificationId", markNotificationAsRead);
router.patch("/mark-all-read", markAllNotificationsAsRead);
router.delete("/delete/:notificationId", deleteNotification);
router.delete("/delete-all", deleteAllNotifications);
router.get("/after", getNotificationsAfterTime);
export default router;
