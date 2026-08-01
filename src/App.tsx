import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import router from '@/routes';
import { useAuthStore } from '@/store/auth.store';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function App() {
  useEffect(() => {
    // Xóa toàn bộ token và đưa trạng thái về chưa đăng nhập khi chạy ứng dụng
    useAuthStore.getState().logout();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#361e15',
              borderRadius: 12,
              fontFamily:
                "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
