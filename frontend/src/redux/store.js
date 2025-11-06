// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Step 1: Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
});

// Step 2: Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // persist only auth
};

// Step 3: Wrap combined reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 4: Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export default store;