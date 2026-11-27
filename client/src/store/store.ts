import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/es/storage";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistedState,
} from "redux-persist";
import themeSlice from "./themeSlice";
import authSlice from "./authSlice";
import notificationSlice from "./notificationSlice";

const persistConfig = {
  key: "root",
  version: 2,
  storage,
  blacklist: ["notification"],
  migrate: async (state: (PersistedState & { notification?: unknown }) | undefined) => {
    if (!state) return state;
    const migrated = { ...state };
    delete migrated.notification;
    return migrated;
  },
};

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
  notification: notificationSlice,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
