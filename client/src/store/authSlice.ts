import { createSlice } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  bloodGroup: string;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  role: "user" | "organization" | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  organization: null,
  role: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = {
        id: action.payload._id,
        name: action.payload.name,
        bloodGroup: action.payload.info.bloodGroup,
      };
      state.organization = null;
      state.role = "user";
      state.isAuthenticated = true;
    },
    loginOrganization: (state, action) => {
      state.organization = {
        id: action.payload._id,
        name: action.payload.name,
      };
      state.user = null;
      state.role = "organization";
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.organization = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, loginOrganization, logout } = authSlice.actions;
export default authSlice.reducer;