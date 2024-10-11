import { IUser } from '@/types/authType';
import Cookies from 'js-cookie';
import { create } from 'zustand';

export interface AuthState {
  isLogin: boolean;
  user: IUser | null;
  isLoading: boolean;
  registerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registerError: string | null;
}

const loginUser = Cookies.get('user');
const userInfo = loginUser ? JSON.parse(loginUser) : null;

export const initialState: AuthState = {
  isLogin: userInfo ? true : false,
  user: userInfo ? userInfo : null,
  isLoading: false,
  registerStatus: 'idle',
  registerError: null,
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
}));
