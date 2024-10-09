import { IUser } from '@/types/authType';
import { registerUserAPI } from '@/api/auth';
import { create } from 'zustand';

interface RegisterUserPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  isLogin: boolean;
  user: IUser | null;
  isLoading: boolean;
  registerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registerError: string | null;
  registerUser: ({
    email,
    password,
    name,
  }: RegisterUserPayload) => Promise<void>;
}

export const initialState: AuthState = {
  isLogin: false,
  user: null,
  isLoading: false,
  registerStatus: 'idle',
  registerError: null,
  registerUser: ({ email, password, name }) => {
    return Promise.resolve();
  },
};

interface AuthActions {
  setIsLogin: (payload: boolean) => void;
  setUser: (payload: IUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  setIsLogin: (payload: boolean) => set((state) => ({ isLogin: payload })),
  setUser: (payload: IUser) =>
    set((state) => ({ isLogin: true, user: payload })),
  logout: () => set((state) => ({ isLogin: false })),

  registerUser: async (
    { email, password, name }: RegisterUserPayload
    // { rejectWithValue }: { rejectWithValue: string }
  ) => {
    set({ isLoading: true, registerStatus: 'loading' }); // pending
    try {
      const response = await registerUserAPI({ email, password, name });

      set({ user: response, isLoading: true, registerStatus: 'succeeded' }); // succeeded
    } catch (error: any) {
      set({
        isLoading: false,
        registerError: error.message || 'Registration failed',
        registerStatus: 'failed',
      }); // rejected
      return;
    }
  },
}));
