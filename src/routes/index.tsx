/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import LoadingFallback from '@/components/ui/LoadingFallback';

// Lazy loading pages for performance optimization as mandated by best_practice.md
const HomePage = lazy(() => import('@/pages/Home'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const PvePage = lazy(() => import('@/pages/PVE'));

// Centralized Router Definition
export const router = createBrowserRouter([
  // Auth Layout (Landing Page, Login, Register)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
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
  // Main Application Layout (App Dashboard, PVE...)
  {
    element: <MainLayout />,
    children: [
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
  // Fallback Wildcard Route -> Landing Page
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
]);

export default router;
