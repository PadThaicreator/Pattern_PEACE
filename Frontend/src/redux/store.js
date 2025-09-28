// redux/store.js

import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // ใช้ localStorage
import userReducer from './userSlice'

// ตั้งค่า persist
const persistConfig = {
  key: 'root',
  storage,
}

// ครอบ userReducer ด้วย persistReducer
const persistedUserReducer = persistReducer(persistConfig, userReducer)

const store = configureStore({
  reducer: {
    user: persistedUserReducer,  // ใส่อันที่ครอบแล้ว
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],  // <-- ignore action เหล่านี้
      },
    }),
})

export const persistor = persistStore(store)
export default store
