import { createSlice } from "@reduxjs/toolkit";

const userInitialState = {
  name: "",
  role: "",
  email: "",
  wallet: 0, 
};

const userSlice = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {
    setUserData: (state, action) => {
      const { name, role, email, wallet } = action.payload;
      state.name = name;
      state.role = role;
      state.email = email;
      state.wallet = wallet;
    },
    resetUserData: (state) => {
      state.name = "";
      state.role = "";
      state.email = "";
      state.wallet = 0;
    },
  },
});

export const { setUserData, resetUserData } = userSlice.actions;
export default userSlice.reducer;