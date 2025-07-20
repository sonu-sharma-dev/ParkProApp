import { createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    activeBooking: null,
    completedBookings: [], // Store completed bookings here
  },
  reducers: {
    setActiveBooking: (state, action) => {
      state.activeBooking = action.payload;
    },
    addCompletedBooking: (state, action) => {
      state.completedBookings.push(action.payload);
    },
  },
});

export const { setActiveBooking, addCompletedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
