import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import plotParamsReducer from '../features/plotParams/plotParamsSlice';


export const store = configureStore({
  reducer: {
    plotParams: plotParamsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
