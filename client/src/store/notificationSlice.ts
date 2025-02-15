import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  _id: string;
  type: string;
  message: string;
  redirectUrl: string;
  data: any;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  lastCheckedAt: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  lastCheckedAt: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload.filter(
        (newNotif) => !state.notifications.some((n) => n._id === newNotif._id)
      );
      state.notifications.unshift(...newNotifications);
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check for duplicates before adding
      const isDuplicate = state.notifications.some(
        (n) => n._id === action.payload._id
      );
      
      if (!isDuplicate) {
        state.notifications.unshift(action.payload);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateLastCheckedAt: (state) => {
      state.lastCheckedAt = new Date().toISOString();
    },
  },
});

export const { 
  addNotifications,
  addNotification, 
  clearNotifications, 
  updateLastCheckedAt,
} = notificationSlice.actions;

export default notificationSlice.reducer;
