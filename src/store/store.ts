import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeReducer, { ThemeState } from "./themeSlice";
import tokenReducer, { TokensState } from "./tokenSlice";
import smartTokenReducer, { SmartTokensState } from "./smartTokenSlice";
import collectionReducer, { CollectionsState } from "./collectionSlice";
import saleReducer, { SalesState } from "./saleSlice";
import dexReducer, { DexState } from "./dexSlice";
import listingReducer, { ListingsState } from "./listingSlice";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import cartReducer from './slices/cartSlice';
import userReducer, { UserState } from './userSlice';

export type RootState = {
  tokens: TokensState;
  smartTokens: TokensState;
  collections: CollectionsState;
  sales: SalesState;
  listings: ListingsState;
  theme: ThemeState;
  dex: DexState;
  user: UserState;
};

// Create separate persist configs for theme and user
const themePersistConfig = {
  key: 'theme',
  storage,
  whitelist: ['isDarkTheme']
};

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['timeFilter']
};

// Create persisted reducers
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const rootReducer = combineReducers({
  theme: persistedThemeReducer,
  tokens: tokenReducer,
  smartTokens: smartTokenReducer,
  collections: collectionReducer,
  sales: saleReducer,
  listings: listingReducer,
  dex: dexReducer,
  cart: cartReducer,
  user: persistedUserReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
