import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { Users, Copy, Check, Sparkles, LogIn, Clock, Shield } from 'lucide-react';
import socketService from '@/services/socket.service';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Create Room State
  const [timeControl, setTimeControl] = useState<number>(15); // minutes
  const [side, setSide] = useState<'random' | 'red' | 'black'>('random');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Join Room State
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Generate random 6-digit room code
  const handleGenerateRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCreatedRoomCode(code);
    socketService.joinRoom(`room_${code}`);
    message.success(`Đã tạo phòng #${code} thành công!`);
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setIsCopied(true);
    message.success('Đã sao chép mã phòng!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    const trimmedCode = inputRoomCode.trim();
    if (!trimmedCode || trimmedCode.length < 4) {
      message.warning('Vui lòng nhập mã phòng hợp lệ!');
      return;
    }

    setIsJoining(true);
    socketService.joinRoom(`room_${trimmedCode}`);
    message.loading({ content: `Đang kết nối vào phòng #${trimmedCode}...`, key: 'join_room' });

    setTimeout(() => {
      setIsJoining(false);
      message.success({ content: `Đã tham gia phòng #${trimmedCode}!`, key: 'join_room' });
      onClose();
    }, 1200);
  };

  const handleResetModal = () => {
    if (createdRoomCode) {
      socketService.leaveRoom(`room_${createdRoomCode}`);
    }
    setCreatedRoomCode(null);
    setInputRoomCode('');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleResetModal}
      footer={null}
      centered
      width={520}
      className="custom-room-modal"
    >
      <div className="p-2 space-y-6">
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-[#d4c3be] pb-4">
          <div className="w-10 h-10 rounded-full bg-[#361e15] flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#442a22]">
              Tạo Phòng & Ghép Đấu Trực Tuyến
            </h2>
            <p className="text-xs text-[#504441]">
              Chơi cờ tướng qua mạng Internet với bạn bè trên bất kỳ thiết bị nào.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#f6f3f2] p-1 rounded-xl border border-[#d4c3be]">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-[#ffffff] text-[#361e15] shadow-xs'
                : 'text-[#504441] hover:text-[#361e15]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo phòng mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'join'
                ? 'bg-[#ffffff] text-[#361e15] shadow-xs'
                : 'text-[#504441] hover:text-[#361e15]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Nhập mã vào phòng</span>
          </button>
        </div>

        {/* Tab 1: Create Room */}
        {activeTab === 'create' && (
          <div>
            {!createdRoomCode ? (
              <div className="space-y-5">
                {/* Time Control Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#361e15]" />
                    <span>Thời gian mỗi ván</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 30].map((mins) => (
                      <button
                        key={`time-${mins}`}
                        type="button"
                        onClick={() => setTimeControl(mins)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          timeControl === mins
                            ? 'bg-[#361e15] text-white border-[#361e15] shadow-xs'
                            : 'bg-white text-[#504441] border-[#d4c3be] hover:bg-[#f6f3f2]'
                        }`}
                      >
                        {mins} phút
                      </button>
                    ))}
                  </div>
                </div>

                {/* Side Option */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#361e15]" />
                    <span>Chọn phe</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide('random')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        side === 'random'
                          ? 'bg-[#361e15] text-white border-[#361e15]'
                          : 'bg-white text-[#504441] border-[#d4c3be]'
                      }`}
                    >
                      Ngẫu nhiên
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('red')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        side === 'red'
                          ? 'bg-red-800 text-white border-red-800'
                          : 'bg-white text-red-900 border-[#d4c3be]'
                      }`}
                    >
                      Cầm Đỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('black')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        side === 'black'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-900 border-[#d4c3be]'
                      }`}
                    >
                      Cầm Đen
                    </button>
                  </div>
                </div>

                {/* Create Action Button */}
                <button
                  type="button"
                  onClick={handleGenerateRoom}
                  className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Phòng & Lấy Mã Khai Cuộc</span>
                </button>
              </div>
            ) : (
              /* Waiting Lobby */
              <div className="bg-[#fcf9f8] border-2 border-dashed border-[#361e15]/40 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-bounce">
                  <Users className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#504441]">Mã phòng của bạn:</p>
                  <div className="text-3xl font-mono font-black text-[#361e15] tracking-widest my-2 select-all">
                    #{createdRoomCode}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="bg-[#361e15] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-[#26140e] cursor-pointer transition-all"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#d4c3be]/60 flex items-center justify-center gap-2 text-xs text-[#504441]">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span>Đang chờ bạn bè hoặc đối thủ nhập mã trên Internet...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Join Room */}
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#442a22] font-serif mb-1.5">
                Nhập mã phòng (6 chữ số)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 839201"
                maxLength={6}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value)}
                className="w-full bg-[#f4f2ee] text-[#1b1c1c] text-center font-mono text-xl font-bold rounded-xl py-3 border border-[#d4c3be] focus:border-[#361e15] focus:bg-white focus:outline-none tracking-widest transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              <span>{isJoining ? 'Đang kết nối...' : 'Tham Gia Ván Đấu'}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateRoomModal;
