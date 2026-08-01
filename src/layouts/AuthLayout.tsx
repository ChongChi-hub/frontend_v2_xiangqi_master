import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthHeader } from '@/components/layouts/AuthHeader';
import { AuthFooter } from '@/components/layouts/AuthFooter';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white antialiased">
      <AuthHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;
