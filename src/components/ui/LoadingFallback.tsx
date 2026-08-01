import React from 'react';
import { Spin } from 'antd';

export const LoadingFallback: React.FC = () => (
  <div className="w-full h-screen flex items-center justify-center bg-[#fcf9f8]">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

export default LoadingFallback;
