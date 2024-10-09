import { RootState } from '@/store';

export const selectIsLogin = (state: RootState): boolean => state.auth.isLogin;
export const selectUser = (state: RootState) => state.auth.user;
