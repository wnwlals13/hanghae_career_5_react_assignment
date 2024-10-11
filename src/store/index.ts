import { create } from 'zustand';

interface storeState {
  showToast: boolean;
  message: string;
  setShowToast: (show: boolean, str?: messageType) => void;
}

const messageStr = {
  rergister: '회원가입에 성공했습니다.',
  login: '로그인에 성공했습니다.',
  upload: '게시글 작성에 성공했습니다.',
  payment: '구매 완료했습니다.',
};
type messageType = keyof typeof messageStr;

export const useStore = create<storeState>((set) => ({
  showToast: false,
  message: '',
  setShowToast: (show: boolean, str?: messageType) => {
    set(() => ({
      showToast: show,
      message: show && str ? messageStr[str] : '',
    }));
  },
}));
