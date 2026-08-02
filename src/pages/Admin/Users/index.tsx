import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Tag, Typography } from 'antd';
import { adminService } from '@/services/admin.service';
import type { UserItem } from '@/services/admin.service';

const { Title, Text } = Typography;

const AdminUsers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsersList', currentPage, pageSize],
    queryFn: () => adminService.getUsersList(currentPage, pageSize),
    refetchInterval: 10000, // Poll every 10 seconds for user list updates
  });

  const columns = [
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'ELO',
      dataIndex: 'eloScore',
      key: 'eloScore',
      render: (score: number) => <Tag color="gold" className="font-bold">{score}</Tag>,
      sorter: (a: UserItem, b: UserItem) => a.eloScore - b.eloScore,
    },
    {
      title: 'Thắng',
      dataIndex: 'winMatches',
      key: 'winMatches',
      render: (val: number) => <Text type="success">{val}</Text>,
    },
    {
      title: 'Hoà',
      dataIndex: 'drawMatches',
      key: 'drawMatches',
      render: (val: number) => <Text type="warning">{val}</Text>,
    },
    {
      title: 'Thua',
      dataIndex: 'loseMatches',
      key: 'loseMatches',
      render: (val: number) => <Text type="danger">{val}</Text>,
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN'),
    },
  ];

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Title level={3} className="!text-[#442a22] !font-serif !mb-2">Quản Lý Người Dùng</Title>
        <Text className="text-[#504441]">Danh sách toàn bộ thành viên trên hệ thống Xiangqi Master</Text>
      </div>

      <Card className="shadow-sm border border-[#d4c3be] bg-white rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={data?.users || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AdminUsers;
