import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layouts/Sidebar';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useAuthStore } from '@/store/auth.store';

export const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-[#fcf9f8] antialiased text-[#1b1c1c]">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Fixed Top AppHeader */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="md:pl-64 pt-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
