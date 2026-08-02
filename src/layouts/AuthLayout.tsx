import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthHeader } from '@/components/layouts/AuthHeader';
import { AuthFooter } from '@/components/layouts/AuthFooter';
import { useAuthStore } from '@/store/auth.store';
import { PageTransition } from '@/components/ui/PageTransition';

export const AuthLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white antialiased">
      <AuthHeader />
      <main className="flex-1 flex flex-col">
        <PageTransition className="flex-1 flex flex-col w-full">
          <Outlet />
        </PageTransition>
      </main>
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;
