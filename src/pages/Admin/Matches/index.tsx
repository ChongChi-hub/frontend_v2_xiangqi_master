import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Tag, Typography } from 'antd';
import { adminService } from '@/services/admin.service';
import type { MatchItem } from '@/services/admin.service';

const { Title, Text } = Typography;

const AdminMatches: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['adminMatchesList', currentPage, pageSize],
    queryFn: () => adminService.getMatchesList(currentPage, pageSize),
    refetchInterval: 5000, // Poll every 5 seconds for real-time match status
  });

  const columns = [
    {
      title: 'Mã Trận',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text type="secondary" className="text-xs font-mono">{id.substring(0, 8)}...</Text>,
    },
    {
      title: 'Người chơi Đỏ',
      key: 'redPlayer',
      render: (_: unknown, record: MatchItem) => (
        <Text strong className="text-[#ba1a1a]">
          {record.redPlayer?.username || 'Unknown'} {record.winnerId === record.redPlayerId && '🏆'}
        </Text>
      ),
    },
    {
      title: 'Người chơi Đen',
      key: 'blackPlayer',
      render: (_: unknown, record: MatchItem) => (
        <Text strong className="text-[#1b1c1c]">
          {record.blackPlayer?.username || 'Unknown'} {record.winnerId === record.blackPlayerId && '🏆'}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'FINISHED') color = 'green';
        if (status === 'ABORTED') color = 'red';
        if (status === 'DRAW') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thời gian thi đấu',
      dataIndex: 'timeControl',
      key: 'timeControl',
      render: (seconds: number) => {
        if (seconds == null) return '00:00';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      }
    },
    {
      title: 'Số nước đi',
      key: 'moves',
      render: (_: unknown, record: MatchItem) => record._count.moves,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN'),
    },
  ];

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Title level={3} className="!text-[#442a22] !font-serif !mb-2">Quản Lý Trận Đấu</Title>
        <Text className="text-[#504441]">Giám sát các trận đấu đang diễn ra và lịch sử toàn hệ thống</Text>
      </div>

      <Card className="shadow-sm border border-[#d4c3be] bg-white rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={data?.matches || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} trận đấu`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default AdminMatches;
