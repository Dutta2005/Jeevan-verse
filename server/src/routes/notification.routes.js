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

const router = express.Router();

// Routes for notifications
router.use(verifyJWT);

// /api/v1/notifications

router.get("/", getAllNotifications);
router.patch("/mark-read/:notificationId", markNotificationAsRead);
router.patch("/mark-all-read", markAllNotificationsAsRead);
router.delete("/delete/:notificationId", deleteNotification);
router.delete("/delete-all", deleteAllNotifications);
router.get("/after", getNotificationsAfterTime);
export default router;