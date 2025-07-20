import { configureStore } from '@reduxjs/toolkit';
import parkingReducer from './parkingSlice';
import userReducer from "./UserSlice";
import bookingSlice from "./bookingSlice";

const store = configureStore({
  reducer: {
    parking: parkingReducer,
    user: userReducer,
    booking: bookingSlice,
  },
});

export default store;
