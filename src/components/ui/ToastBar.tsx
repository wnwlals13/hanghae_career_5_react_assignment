import { useStore } from '@/store';
import { useEffect } from 'react';

interface IToastBarProps {
  duration?: number;
  onClose: () => void;
}
export default function ToastBar({ duration = 3000, onClose }: IToastBarProps) {
  const message = useStore((state) => state.message);
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);
  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 p-1 bg-primary font-bold text-white w-64 flex justify-center opacity-0 rounded-sm animate-[toast-updown_2s_ease-in-out]">
      {message}
    </div>
  );
}
