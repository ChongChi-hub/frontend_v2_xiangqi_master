import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { Users, Gamepad2, History, Home } from 'lucide-react';
import { adminService } from '@/services/admin.service';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 3000, // Real-time polling every 3 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-red-500">
        Đã có lỗi xảy ra khi tải dữ liệu thống kê.
      </div>
    );
  }

  const columns = [
    {
      title: 'Hạng',
      key: 'rank',
      render: (_: unknown, __: unknown, index: number) => <span className="font-bold text-[#ba1a1a]">#{index + 1}</span>,
      width: 80,
    },
    {
      title: 'Tên người chơi',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <span className="font-semibold text-[#442a22]">{text}</span>,
    },
    {
      title: 'ELO',
      dataIndex: 'eloScore',
      key: 'eloScore',
      render: (score: number) => <Tag color="gold" className="font-bold">{score}</Tag>,
    },
    {
      title: 'Số trận thắng',
      dataIndex: 'winMatches',
      key: 'winMatches',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#442a22] font-serif mb-2">Tổng Quan Hệ Thống</h2>
        <p className="text-[#504441]">Dữ liệu được cập nhật theo thời gian thực (real-time)</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border border-[#d4c3be] bg-white rounded-2xl hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-[#504441] font-medium flex items-center gap-2"><Users className="w-4 h-4"/> Tổng Người Dùng</span>}
              value={stats.totalUsers} 
              valueStyle={{ color: '#442a22', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border border-[#d4c3be] bg-white rounded-2xl hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-[#504441] font-medium flex items-center gap-2"><History className="w-4 h-4"/> Tổng Trận Đấu</span>}
              value={stats.totalMatches} 
              valueStyle={{ color: '#442a22', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border border-[#ba1a1a]/30 bg-[#ffdad6]/20 rounded-2xl hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-[#ba1a1a] font-medium flex items-center gap-2"><Gamepad2 className="w-4 h-4"/> Trận Đang Diễn Ra</span>}
              value={stats.activeMatches} 
              valueStyle={{ color: '#ba1a1a', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border border-[#d4c3be] bg-white rounded-2xl hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-[#504441] font-medium flex items-center gap-2"><Home className="w-4 h-4"/> Phòng Đang Mở</span>}
              value={stats.activeRooms} 
              valueStyle={{ color: '#442a22', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={<span className="text-xl font-serif text-[#442a22]">Top 5 Kỳ Thủ Xuất Sắc Nhất</span>} 
        className="shadow-sm border border-[#d4c3be] bg-white rounded-2xl overflow-hidden"
      >
        <Table 
          dataSource={stats.topPlayers} 
          columns={columns} 
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
