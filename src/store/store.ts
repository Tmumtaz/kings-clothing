import { compose, createStore, applyMiddleware, Middleware } from "redux";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { rootReducer } from "./root-reducer";
import logger from 'redux-logger';


import createSagaMiddleware from 'redux-saga'

import { rootSaga } from "./root-saga";

export type RootState = ReturnType<typeof rootReducer>

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}

type ExtendedPersisConfig = PersistConfig<RootState> & {
  whitelist: (keyof RootState)[]
}

const sagaMiddleware = createSagaMiddleware();

const middleWares = [
    process.env.NODE_ENV === 'development' && logger,
    sagaMiddleware
  ].filter((middleware): middleware is Middleware => Boolean(middleware));
  
  const composeEnhancer =
    (process.env.NODE_ENV !== 'production' &&
      window &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;
  
  const persistConfig: ExtendedPersisConfig = {
    key: 'root',
    storage,
    whitelist: ['cart'],
  };


  
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  
  const composedEnhancers = composeEnhancer(applyMiddleware(...middleWares));
  
  export const store = createStore(
    persistedReducer,
    undefined,
    composedEnhancers
  );

  sagaMiddleware.run(rootSaga);
  
  export const persistor = persistStore(store);