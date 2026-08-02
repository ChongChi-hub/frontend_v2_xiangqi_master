import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layouts/Sidebar';
import { AppHeader } from '@/components/layouts/AppHeader';
import AdminRoute from '@/components/auth/AdminRoute';
import { PageTransition } from '@/components/ui/PageTransition';

export const AdminLayout: React.FC = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#fcf9f8] antialiased text-[#1b1c1c]">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Fixed Top AppHeader */}
        <AppHeader />

        {/* Main Content Area */}
        <main className="md:pl-64 pt-16 min-h-screen">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;
