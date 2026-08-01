import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error Boundary catch:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#fcf9f8] p-6">
          <Result
            status="error"
            title="Đã xảy ra lỗi ứng dụng"
            subTitle="Hệ thống gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc thử lại sau."
            extra={[
              <Button
                key="reload"
                type="primary"
                onClick={this.handleReload}
                className="bg-[#361e15] hover:bg-[#4a2c20] border-none"
              >
                Tải lại trang
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
