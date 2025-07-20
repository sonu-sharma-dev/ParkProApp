import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location: "",
  name: "",
  price: 0,
  slot: "",
  startTime: "",
  endTime: "",
  completedBookings: [], // Array to store completed bookings
};

const parkingSlice = createSlice({
  name: "parking",
  initialState,
  reducers: {
    setParkingData: (state, action) => {
      const { location, name, price, slot, startTime, endTime } = action.payload;
      state.location = location;
      state.name = name;
      state.price = price;
      state.slot = slot;
      state.startTime = startTime;
      state.endTime = endTime;
    },
    resetParkingData: (state) => {
      state.location = "";
      state.name = "";
      state.price = 0;
      state.slot = "";
      state.startTime = "";
      state.endTime = "";
    },
    addCompletedBooking: (state, action) => {
      state.completedBookings.push(action.payload); // Add completed booking to the array
    },
  },
});

export const { setParkingData, resetParkingData, addCompletedBooking } = parkingSlice.actions;
export default parkingSlice.reducer;
