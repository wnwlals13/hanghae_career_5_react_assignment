import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { pageRoutes } from '@/apiRoutes';
import { NavigationBar } from './NavigationBar';
import { useAuthStore } from '@/store/auth/authStore';
import ToastBar from '../../../components/ui/ToastBar';
import { useStore } from '@/store';

export const authStatusType = {
  NEED_LOGIN: 'NEED_LOGIN',
  NEED_NOT_LOGIN: 'NEED_NOT_LOGIN',
  COMMON: 'COMMON',
};

interface LayoutProps {
  children: ReactNode;
  containerClassName?: string;
  authStatus?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  containerClassName = '',
  authStatus = authStatusType.COMMON,
}) => {
  const isLogin = useAuthStore((state) => state.isLogin);
  const showToast = useStore((state) => state.showToast);
  const setShowToast = useStore((state) => state.setShowToast);

  if (authStatus === authStatusType.NEED_LOGIN && !isLogin) {
    return <Navigate to={pageRoutes.login} />;
  }

  if (authStatus === authStatusType.NEED_NOT_LOGIN && isLogin) {
    return <Navigate to={pageRoutes.main} />;
  }

  return (
    <div>
      <NavigationBar />
      <div className="flex flex-col min-h-screen mt-24">
        <main className="flex-grow">
          <div className={`container mx-auto px-4 ${containerClassName}`}>
            {children}
          </div>
        </main>
      </div>
      {showToast && (
        <ToastBar
          onClose={() => {
            setShowToast(false);
          }}
        />
      )}
    </div>
  );
};
