import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Typography, InputNumber, Button, message, Tag } from 'antd';
import { Brain, Save, Info } from 'lucide-react';
import { adminService } from '@/services/admin.service';

const { Title, Text } = Typography;

const DEFAULT_SETTINGS = [
  { difficulty: 'beginner', label: 'Mới chơi', color: 'green', depth: 2, movetime: 250 },
  { difficulty: 'apprentice', label: 'Nghiệp dư', color: 'cyan', depth: 4, movetime: 450 },
  { difficulty: 'intermediate', label: 'Trung bình', color: 'blue', depth: 7, movetime: 800 },
  { difficulty: 'master', label: 'Cao thủ', color: 'purple', depth: 11, movetime: 1500 },
  { difficulty: 'grandmaster', label: 'Kiện tướng', color: 'red', depth: 15, movetime: 2500 },
];

const AdminBotSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string>('');
  const [editDepth, setEditDepth] = useState<number>(0);
  const [editMovetime, setEditMovetime] = useState<number>(0);

  const { data: dbSettings = [], isLoading } = useQuery({
    queryKey: ['adminBotSettings'],
    queryFn: adminService.getBotSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { difficulty: string; depth: number; movetime: number }) => 
      adminService.updateBotSetting(data.difficulty, data.depth, data.movetime),
    onSuccess: () => {
      message.success('Cập nhật cấu hình thành công!');
      setEditingKey('');
      queryClient.invalidateQueries({ queryKey: ['adminBotSettings'] });
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi lưu cấu hình.');
    }
  });

  // Merge DB settings with defaults
  const dataSource = DEFAULT_SETTINGS.map(def => {
    const dbItem = dbSettings.find(s => s.difficulty === def.difficulty);
    return {
      key: def.difficulty,
      difficulty: def.difficulty,
      label: def.label,
      color: def.color,
      depth: dbItem ? dbItem.depth : def.depth,
      movetime: dbItem ? dbItem.movetime : def.movetime,
    };
  });

  const isEditing = (record: any) => record.key === editingKey;

  const edit = (record: any) => {
    setEditDepth(record.depth);
    setEditMovetime(record.movetime);
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (difficulty: string) => {
    updateMutation.mutate({ difficulty, depth: editDepth, movetime: editMovetime });
  };

  const columns = [
    {
      title: 'Mức độ',
      dataIndex: 'label',
      key: 'label',
      render: (text: string, record: any) => (
        <Tag color={record.color} className="font-bold text-sm px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Độ Sâu (Depth)',
      dataIndex: 'depth',
      key: 'depth',
      render: (val: number, record: any) => {
        return isEditing(record) ? (
          <InputNumber min={1} max={30} value={editDepth} onChange={(v) => setEditDepth(v || 1)} />
        ) : (
          <Text strong>{val} <span className="text-gray-400 font-normal">nước đi</span></Text>
        );
      }
    },
    {
      title: 'Thời Gian Suy Nghĩ (ms)',
      dataIndex: 'movetime',
      key: 'movetime',
      render: (val: number, record: any) => {
        return isEditing(record) ? (
          <InputNumber min={10} max={10000} step={100} value={editMovetime} onChange={(v) => setEditMovetime(v || 10)} />
        ) : (
          <Text strong>{val} <span className="text-gray-400 font-normal">ms</span></Text>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex gap-2">
            <Button type="primary" className="bg-[#361e15]" icon={<Save className="w-4 h-4"/>} onClick={() => save(record.difficulty)} loading={updateMutation.isPending}>
              Lưu
            </Button>
            <Button onClick={cancel}>Hủy</Button>
          </div>
        ) : (
          <Button onClick={() => edit(record)} disabled={editingKey !== ''}>
            Chỉnh sửa
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Title level={3} className="!text-[#442a22] !font-serif !mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7" />
          Cấu Hình Trí Tuệ Nhân Tạo (AI Bot)
        </Title>
        <Text className="text-[#504441]">Điều chỉnh độ khó của Bot cho chế độ Đánh với máy (PVE)</Text>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Hướng dẫn thông số:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Độ sâu (Depth)</strong>: Số nước đi tối đa mà Bot được phép nhìn trước. Càng cao bot đánh càng hay nhưng tốn nhiều CPU. (Khuyên dùng: 2 đến 15)</li>
            <li><strong>Thời gian (Movetime)</strong>: Giới hạn thời gian suy nghĩ tối đa tính bằng mili-giây. Ví dụ: 1000 = 1 giây. (Khuyên dùng: 250 đến 3000)</li>
          </ul>
        </div>
      </div>

      <Card className="shadow-sm border border-[#d4c3be] bg-white rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          loading={isLoading}
        />
      </Card>
    </div>
  );
};

export default AdminBotSettings;
