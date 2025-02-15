import { configureStore, combineReducers} from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import themeSlice from './themeSlice'
import authSlice from './authSlice'
import notificationSlice from './notificationSlice'

const persistConfig = {
    key: 'root',
    version: 1,
    storage
}

const reducer = combineReducers({
    theme: themeSlice,
    auth: authSlice,
    notification: notificationSlice

});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })    
})

export type RootState = ReturnType<typeof store.getState>