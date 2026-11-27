import { createAction, createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/api/api";
import type { RootState } from "./store";

export interface Notification {
  _id: string;
  type: string;
  message: string;
  redirectUrl: string;
  createdAt?: string;
  isRead: boolean;
}

const initialState = {
  owner: null as string | null,
  notifications: [] as Notification[],
  requestId: null as string | null,
  status: "idle" as "idle" | "loading" | "ready" | "error",
  live: false,
  actionError: null as string | null,
};

export const loadNotifications = createAsyncThunk(
  "notification/load",
  async (owner: string, { signal }): Promise<Notification[]> => {
    const { data } = await api.get<{ data: Notification[] }>("/notifications/", {
      signal,
      headers: { "X-Notification-Account": owner },
    });
    if (!Array.isArray(data?.data)) throw new Error("Invalid notification response");
    return data.data.map(({ _id, type, message, redirectUrl, createdAt, isRead }) => ({
      _id,
      type,
      message,
      redirectUrl,
      createdAt,
      isRead,
    }));
  },
);

type Change = { kind: "read" | "delete"; id: string } | { kind: "readAll" | "deleteAll" };

const confirmNotificationChange = createAction<{ owner: string; change: Change; ids: string[] }>(
  "notification/confirmChange",
);

const changeErrors = {
  read: "Could not mark this notification as read.",
  readAll: "Could not mark notifications as read.",
  delete: "Could not delete this notification.",
  deleteAll: "Could not clear notifications.",
};

export const changeNotifications = createAsyncThunk<
  void,
  Change,
  { state: RootState; rejectValue: string }
>("notification/change", async (change, { getState, dispatch, rejectWithValue }) => {
  const owner = getState().notification.owner;
  if (!owner || getState().auth.user?.id !== owner) return;
  const config = { headers: { "X-Notification-Account": owner } };
  const ids =
    "id" in change ? [change.id] : getState().notification.notifications.map(({ _id }) => _id);

  try {
    switch (change.kind) {
      case "read":
        await api.patch(
          `/notifications/mark-read/${encodeURIComponent(change.id)}`,
          undefined,
          config,
        );
        break;
      case "delete":
        await api.delete(`/notifications/delete/${encodeURIComponent(change.id)}`, config);
        break;
      case "readAll":
        await api.patch("/notifications/mark-all-read", undefined, config);
        break;
      case "deleteAll":
        await api.delete("/notifications/delete-all", config);
        break;
    }
  } catch {
    if (getState().auth.user?.id === owner) return rejectWithValue(changeErrors[change.kind]);
    return;
  }

  if (getState().auth.user?.id === owner) {
    dispatch(confirmNotificationChange({ owner, change, ids }));
    await dispatch(loadNotifications(owner));
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotificationOwner: (_, action: PayloadAction<string | null>) => ({
      ...initialState,
      owner: action.payload,
    }),
    setNotificationsLive: (state, action: PayloadAction<boolean>) => {
      state.live = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmNotificationChange, (state, { payload }) => {
        if (state.owner !== payload.owner) return;
        const ids = new Set(payload.ids);
        state.requestId = null;
        if (payload.change.kind === "delete" || payload.change.kind === "deleteAll") {
          state.notifications = state.notifications.filter(({ _id }) => !ids.has(_id));
        } else {
          for (const notification of state.notifications) {
            if (ids.has(notification._id)) notification.isRead = true;
          }
        }
      })
      .addCase(loadNotifications.pending, (state, action) => {
        if (state.owner !== action.meta.arg) return;
        state.requestId = action.meta.requestId;
        state.status = "loading";
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "ready";
        state.notifications = action.payload;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = action.meta.aborted ? "idle" : "error";
      })
      .addCase(changeNotifications.pending, (state) => {
        state.actionError = null;
      })
      .addCase(changeNotifications.rejected, (state, action) => {
        state.actionError = action.payload ?? null;
      });
  },
});

export function selectNotificationInbox(state: RootState) {
  return state.notification.owner && state.notification.owner === state.auth.user?.id
    ? state.notification
    : initialState;
}

export const { setNotificationOwner, setNotificationsLive } = notificationSlice.actions;
export default notificationSlice.reducer;
