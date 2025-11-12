// packages/login-signup/src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

/**
 * Signup thunk
 * payload: { email, name, password, phoneNumber?, role? }
 */
export const signup = createAsyncThunk(
  'auth/signup',
  async (
    payload: { email: string; name: string; password: string; phoneNumber?: string; role?: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post('/users/signup', payload);
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? JSON.stringify(err?.response?.data) ?? err.message ?? 'Signup failed';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/**
 * Login thunk
 * payload: { email, password }
 * expects token/user in response (defensive extraction)
 */
export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await api.post('/users/login', payload);
      const data = res.data ?? {};

      // defensive extraction of token/user from common response shapes
      const token =
        data.token ?? data.accessToken ?? data.access_token ?? data.data?.token ?? null;
      const user = data.user ?? data.data?.user ?? data;

      if (token) localStorage.setItem('token', token);

      return { token, user };
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? JSON.stringify(err?.response?.data) ?? err.message ?? 'Login failed';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // signup
      .addCase(signup.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(signup.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(signup.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload ?? a.error?.message);
      })

      // login
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user && typeof a.payload.user === 'object' ? a.payload.user : null;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload ?? a.error?.message);
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
