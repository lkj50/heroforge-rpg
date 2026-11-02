import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import stats from './slices/statsSlice';
import inventory from './slices/inventorySlice';
import actionLog from './slices/actionLogSlice';

export const store = configureStore({
  reducer: {
    stats,
    inventory,
    actionLog,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
