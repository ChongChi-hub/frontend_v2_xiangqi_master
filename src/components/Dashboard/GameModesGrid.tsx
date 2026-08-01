import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserCheck, Bot, KeyRound } from 'lucide-react';
import type { AIDifficultyLevel } from '@/types/ai';

interface GameModesGridProps {
  onStartPvp?: () => void;
}

export const GameModesGrid: React.FC<GameModesGridProps> = ({ onStartPvp }) => {
  const navigate = useNavigate();
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficultyLevel>('intermediate');
  const [roomCode, setRoomCode] = useState('');

  const handlePlayAi = () => {
    navigate(`/pve?difficulty=${aiDifficulty}`);
  };

  const handleJoinPrivateRoom = () => {
    const trimmed = roomCode.trim();
    if (!trimmed) {
      message.error('Vui lòng nhập mã phòng hợp lệ!');
      return;
    }
    if (trimmed.length < 4) {
      message.error('Mã phòng phải chứa ít nhất 4 ký tự!');
      return;
    }
    message.loading({ content: `Đang kết nối vào phòng ${trimmed}...`, key: 'room_join' });
    setTimeout(() => {
      message.success({ content: `Đã kết nối phòng ${trimmed}`, key: 'room_join' });
    }, 1000);
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: PvP (Đấu với người) */}
      <div
        onClick={onStartPvp}
        className="group bg-[#ffffff] border border-[#d4c3be] rounded-xl overflow-hidden hover:border-[#442a22] transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
      >
        <div className="h-28 bg-[#e1dfdb] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[#442a22]/10 pointer-events-none" />
          <UserCheck className="w-14 h-14 text-[#442a22] group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="p-4 text-center">
          <h4 className="font-serif text-lg font-bold text-[#442a22]">
            Đấu với người
          </h4>
          <p className="text-xs text-[#504441] mt-1">Phòng chờ PvP thời gian thực</p>
        </div>
      </div>

      {/* Card 2: AI Engine (Đấu với AI) */}
      <div className="group bg-[#ffffff] border border-[#d4c3be] rounded-xl overflow-hidden hover:border-[#442a22] transition-all shadow-2xs hover:shadow-md flex flex-col justify-between">
        <div className="h-28 bg-[#005313]/10 flex items-center justify-center p-4">
          <Bot className="w-14 h-14 text-[#005313] group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <h4 className="font-serif text-lg font-bold text-[#442a22] text-center">
            Đấu với AI
          </h4>
          <div className="space-y-2">
            <select
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value as AIDifficultyLevel)}
              className="w-full bg-[#fcf9f8] border border-[#d4c3be] rounded-lg text-xs py-2 px-3 text-[#1b1c1c] font-medium focus:ring-[#442a22] focus:border-[#442a22] outline-none"
            >
              <option value="beginner">Nhập môn</option>
              <option value="apprentice">Tập sự</option>
              <option value="intermediate">Trung cấp</option>
              <option value="master">Cao thủ</option>
              <option value="grandmaster">Đại kiện tướng</option>
            </select>
            <button
              type="button"
              onClick={handlePlayAi}
              className="w-full bg-[#442a22] text-[#ffffff] py-2 rounded-lg text-xs font-bold font-serif hover:bg-[#5d4037] transition-colors cursor-pointer"
            >
              Chơi ngay
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Private Room (Phòng riêng) */}
      <div className="group bg-[#ffffff] border border-[#d4c3be] rounded-xl overflow-hidden hover:border-[#442a22] transition-all shadow-2xs hover:shadow-md flex flex-col justify-between">
        <div className="h-28 bg-[#e4e2e1]/60 flex items-center justify-center p-4">
          <KeyRound className="w-14 h-14 text-[#504441] group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <h4 className="font-serif text-lg font-bold text-[#442a22] text-center">
            Phòng riêng
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Mã phòng"
              className="w-full bg-[#fcf9f8] border border-[#d4c3be] rounded-lg text-xs px-2.5 py-2 text-[#1b1c1c] focus:ring-[#442a22] focus:border-[#442a22] outline-none"
            />
            <button
              type="button"
              onClick={handleJoinPrivateRoom}
              className="bg-[#442a22] text-[#ffffff] px-3 py-2 rounded-lg text-xs font-bold font-serif hover:bg-[#5d4037] transition-colors shrink-0 cursor-pointer"
            >
              Tham gia
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameModesGrid;
