import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layouts/Sidebar';
import { AppHeader } from '@/components/layouts/AppHeader';

export const MainLayout: React.FC = () => {
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
