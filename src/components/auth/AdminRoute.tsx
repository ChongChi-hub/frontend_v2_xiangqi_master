import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { message } from 'antd';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    message.warning('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" replace />;
  }

  // Chú ý: Dựa vào schema Backend, role là 'ADMIN'
  if (user?.role !== 'ADMIN') {
    message.error('Bạn không có quyền truy cập trang quản trị');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
