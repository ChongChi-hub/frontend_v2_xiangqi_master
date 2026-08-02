import React from 'react';
import { useHistory } from '@/hooks/useUser';
import { useAuthStore } from '@/store/auth.store';
import { Spin, Card, Typography, Empty, Tag } from 'antd';
import { Clock, CheckCircle2, XCircle, MinusCircle, User as UserIcon } from 'lucide-react';

const { Title, Text } = Typography;

const DEFAULT_AVATAR = "https://res.cloudinary.com/znkrqbvm/image/upload/v1785675573/xiangqi_avatars/vlbrdpdmurh7mwtmqbxt.png";

const HistoryPage: React.FC = () => {
  const { data, isLoading } = useHistory();
  const { user } = useAuthStore();

  const matches = data?.matches || [];

  const formatDuration = (seconds: number) => {
    if (seconds == null) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderResult = (match: any, isRed: boolean) => {
    if (match.status === 'DRAW') {
      return <Tag color="default" className="flex items-center gap-1 font-bold"><MinusCircle className="w-3 h-3" /> HÒA</Tag>;
    }
    const isWinner = match.winnerId === user?.id;
    if (isWinner) {
      return <Tag color="success" className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> THẮNG</Tag>;
    }
    return <Tag color="error" className="flex items-center gap-1 font-bold"><XCircle className="w-3 h-3" /> THUA</Tag>;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 p-6 rounded-3xl border border-[#d4c3be] shadow-sm backdrop-blur-md">
        <div>
          <Title level={3} className="!text-[#442a22] !font-serif !mb-1">Lịch Sử Đấu</Title>
          <Text className="text-[#504441] text-sm">Xem lại các trận đấu gần đây của bạn</Text>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : matches.length === 0 ? (
        <Card className="rounded-3xl border-[#d4c3be] bg-white/60 backdrop-blur-md shadow-sm">
          <Empty description="Bạn chưa chơi trận nào" />
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match: any) => {
            const isRed = match.redPlayerId === user?.id;
            const myPlayer = isRed ? match.redPlayer : match.blackPlayer;
            const opponentPlayer = isRed ? match.blackPlayer : match.redPlayer;
            
            // For PVE, opponent player might be null if not populated correctly, but let's assume it exists.
            const opponentAvatar = opponentPlayer?.avatarUrl || DEFAULT_AVATAR;
            const myAvatar = myPlayer?.avatarUrl || DEFAULT_AVATAR;
            const opponentName = opponentPlayer?.username || 'Pikafish_AI';

            const myColorClass = isRed ? 'text-red-700' : 'text-stone-900';
            const opponentColorClass = isRed ? 'text-stone-900' : 'text-red-700';

            return (
              <Card 
                key={match.id} 
                hoverable 
                className={`rounded-2xl border transition-all cursor-default shadow-sm ${
                  match.status === 'DRAW' ? 'border-stone-300 bg-stone-50/50' : 
                  match.winnerId === user?.id ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50'
                }`}
                styles={{ body: { padding: '16px 20px' } }}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  
                  {/* Left Side: Result & Time info */}
                  <div className="flex flex-col items-center md:items-start min-w-[120px]">
                    <div className="mb-2">
                      {renderResult(match, isRed)}
                    </div>
                    <div className="text-xs text-stone-500 font-medium">
                      {new Date(match.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Middle: Players Matchup */}
                  <div className="flex items-center gap-4 sm:gap-8 flex-1 justify-center">
                    
                    {/* Me */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-1 shadow-sm ${isRed ? 'border-red-600' : 'border-stone-800'}`}>
                        <img src={myAvatar} alt="Bạn" className="w-full h-full object-cover" />
                      </div>
                      <Text strong className={`text-sm ${myColorClass}`}>BẠN</Text>
                      <Text className="text-[10px] text-stone-500">{myPlayer?.eloScore} ELO</Text>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1">
                       <span className="text-xs font-black text-stone-400 font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-1 shadow-sm ${!isRed ? 'border-red-600' : 'border-stone-800'}`}>
                        <img src={opponentAvatar} alt={opponentName} className="w-full h-full object-cover" />
                      </div>
                      <Text strong className={`text-sm ${opponentColorClass}`}>{opponentName}</Text>
                      <Text className="text-[10px] text-stone-500">{opponentPlayer?.eloScore || 2800} ELO</Text>
                    </div>

                  </div>

                  {/* Right Side: Game Stats */}
                  <div className="flex items-center gap-3 md:gap-6 min-w-[120px] justify-end">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-stone-600 font-mono text-sm bg-white px-2 py-1 rounded-md border border-stone-200 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(match.timeControl)}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {match._count?.moves || 0} nước đi
                      </div>
                    </div>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
