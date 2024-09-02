import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface AuthErrorType {
  msg: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  url: string;
  username: string;
  membershipStatus: "free" | "paid";
  createdAt: string;
}

interface authState {
  isAuthenticated: boolean;
  user: User | null | undefined; // Adjust the type as needed
}

const initialState: authState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginFailure, loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;

export const isAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const currentUser = (state: RootState) => state.auth.user;
