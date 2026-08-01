import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

// Lazy loading pages for performance optimization as mandated by best_practice.md
const HomePage = lazy(() => import('@/pages/Home'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const PvePage = lazy(() => import('@/pages/PVE'));

// Suspense fallback spinner
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center bg-[#fcf9f8]">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// Centralized Router Definition
export const router = createBrowserRouter([
  // Main Application Layout (App Dashboard, PVE...)
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/pve',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PvePage />
          </Suspense>
        ),
      },
    ],
  },
  // Auth Layout (Landing, Login, Register)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/home',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  // Fallback Wildcard Route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
