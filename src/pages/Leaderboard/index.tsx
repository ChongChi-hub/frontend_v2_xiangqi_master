import React, { useState } from 'react';
import { useLeaderboard } from '@/hooks/useUser';
import { useAuthStore } from '@/store/auth.store';
import { Spin, Table, Pagination } from 'antd';
import { Trophy, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LeaderboardItem } from '@/types/user';

const LeaderboardPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
  const { data: leaderboardData, isLoading } = useLeaderboard(currentPage, pageSize);
  const { user } = useAuthStore();

  const items = leaderboardData?.leaderboard || [];
  const total = leaderboardData?.pagination?.total || 0;

  const top3 = items.slice(0, 3);
  const others = items.slice(3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400 drop-shadow-sm" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600 drop-shadow-sm" />;
      default:
        return <span className="font-bold text-[#827470]">{rank}</span>;
    }
  };

  const columns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => {
        const actualRank = (currentPage - 1) * pageSize + index + (currentPage === 1 ? 4 : 1);
        return <div className="flex justify-center">{getRankBadge(actualRank)}</div>;
      },
    },
    {
      title: 'Kỳ Thủ',
      key: 'username',
      render: (_: any, record: LeaderboardItem) => {
        const isSelf = user?.id === record.id;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#d4c3be] overflow-hidden bg-white shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHDRcOs7ncvcOBUMISVy1a_NpuPcNcRO4kuyUvrqPAGmZd3FAt-6EHm48k72xsNwSIeEEYn92-ZMMeC-z9Zp0Zm2VMtHAEyz1slxIsyLxx4P_NEUikiFKRYJu84IrxDWPxNU2XZ0YtNb6y1oTmZVrm63FDlxF0SImne4yPrm9Rsg_infXqFLwuNGHZHRlIznVuYoC-_zR-5upV2XSKEU_5SxCeB0c_mqwfTZQcKDBf2S_A-5KTzzTv" 
                alt={record.username} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`font-semibold ${isSelf ? 'text-[#361e15]' : 'text-[#442a22]'}`}>
              {record.username} {isSelf && <span className="text-xs text-[#827470] font-normal ml-1">(Bạn)</span>}
            </span>
          </div>
        );
      },
    },
    {
      title: 'ELO',
      dataIndex: 'eloScore',
      key: 'eloScore',
      align: 'center' as const,
      render: (elo: number) => (
        <span className="font-bold text-[#ba1a1a] bg-[#ffdad6]/20 px-3 py-1 rounded-full border border-[#ba1a1a]/20">
          {elo}
        </span>
      ),
    },
    {
      title: 'Tỉ Lệ Thắng',
      key: 'winRate',
      align: 'center' as const,
      render: (_: any, record: LeaderboardItem) => {
        const total = record.winMatches + record.loseMatches + record.drawMatches;
        const winRate = total > 0 ? (record.winMatches / total) * 100 : 0;
        return <span className="text-[#504441]">{Math.round(winRate)}%</span>;
      },
    },
    {
      title: 'Số Trận',
      key: 'totalMatches',
      align: 'center' as const,
      render: (_: any, record: LeaderboardItem) => (
        <span className="text-[#504441]">
          {record.winMatches + record.loseMatches + record.drawMatches}
        </span>
      ),
    },
  ];

  const PodiumItem = ({ item, rank, height }: { item: LeaderboardItem, rank: number, height: string }) => {
    const isSelf = user?.id === item.id;
    const isFirst = rank === 1;
    
    return (
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: rank * 0.1, duration: 0.5, type: 'spring' }}
        className="flex flex-col items-center justify-end"
      >
        <div className="flex flex-col items-center mb-3">
          <div className="relative mb-2">
            {isFirst && <Crown className="absolute -top-6 -left-3 w-8 h-8 text-yellow-500 drop-shadow-md z-10 -rotate-12" />}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${
              rank === 1 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
              rank === 2 ? 'border-slate-300' : 'border-amber-600'
            } overflow-hidden bg-white relative z-0`}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHDRcOs7ncvcOBUMISVy1a_NpuPcNcRO4kuyUvrqPAGmZd3FAt-6EHm48k72xsNwSIeEEYn92-ZMMeC-z9Zp0Zm2VMtHAEyz1slxIsyLxx4P_NEUikiFKRYJu84IrxDWPxNU2XZ0YtNb6y1oTmZVrm63FDlxF0SImne4yPrm9Rsg_infXqFLwuNGHZHRlIznVuYoC-_zR-5upV2XSKEU_5SxCeB0c_mqwfTZQcKDBf2S_A-5KTzzTv" 
                alt={item.username} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold border-2 border-white ${
              rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-600'
            }`}>
              {rank}
            </div>
          </div>
          <p className="font-serif font-bold text-[#442a22] text-sm sm:text-base text-center max-w-[100px] truncate">
            {item.username}
          </p>
          {isSelf && <p className="text-[10px] text-[#827470]">(Bạn)</p>}
          <p className="font-bold text-[#ba1a1a] text-xs sm:text-sm mt-1">{item.eloScore} ELO</p>
        </div>
        
        {/* Podium Base */}
        <div 
          className={`w-24 sm:w-32 rounded-t-lg shadow-inner flex justify-center items-end pb-4 border border-b-0 ${
            rank === 1 ? 'bg-gradient-to-t from-[#f6f3f2] to-yellow-100/50 border-yellow-200' : 
            rank === 2 ? 'bg-gradient-to-t from-[#f6f3f2] to-slate-100 border-slate-200' : 
            'bg-gradient-to-t from-[#f6f3f2] to-amber-100/30 border-amber-200/50'
          }`}
          style={{ height }}
        >
          <span className="text-4xl font-serif text-[#d4c3be]/50 font-bold">{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -z-10"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#ffdad6] to-[#f6f3f2] shadow-sm mb-2"
        >
          <Trophy className="w-8 h-8 text-[#ba1a1a]" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-[#361e15]">
          Bảng Vàng Danh Dự
        </h1>
        <p className="text-[#504441] max-w-lg mx-auto">
          Nơi vinh danh những kỳ thủ xuất sắc nhất Xiangqi Master. Hãy thi đấu hết mình để ghi danh lên bảng vàng!
        </p>
      </div>

      {isLoading && currentPage === 1 ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Only on Page 1) */}
          {currentPage === 1 && top3.length > 0 && (
            <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-8 pt-8 pb-4">
              {top3[1] && <PodiumItem item={top3[1]} rank={2} height="120px" />}
              {top3[0] && <PodiumItem item={top3[0]} rank={1} height="160px" />}
              {top3[2] && <PodiumItem item={top3[2]} rank={3} height="90px" />}
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d4c3be] overflow-hidden">
            <Table
              columns={columns}
              dataSource={currentPage === 1 ? others : items}
              rowKey="id"
              pagination={false}
              className="custom-leaderboard-table"
              rowClassName={(record) => 
                record.id === user?.id ? 'bg-[#5d4037]/5 hover:bg-[#5d4037]/10' : ''
              }
            />
            
            {/* Pagination */}
            {total > 0 && (
              <div className="p-4 border-t border-[#d4c3be]/50 flex justify-center bg-[#f6f3f2]/30">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
