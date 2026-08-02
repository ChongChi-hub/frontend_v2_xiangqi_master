import React, { useState } from 'react';
import { message } from 'antd';
import { Lock, Sparkles, Copy, Check, LogIn, Clock, Shield, Users, Radio } from 'lucide-react';
import socketService from '@/services/socket.service';

export const RoomsPage: React.FC = () => {
  // Create Room State
  const [timeControl, setTimeControl] = useState<number>(15);
  const [side, setSide] = useState<'random' | 'red' | 'black'>('random');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Join Room State
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Generate random 6-digit room code
  const handleCreateRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCreatedRoomCode(code);
    socketService.joinRoom(`room_${code}`);
    message.success(`Đã khởi tạo phòng riêng #${code}!`);
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setIsCopied(true);
    message.success('Đã sao chép mã phòng!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCancelCreatedRoom = () => {
    if (createdRoomCode) {
      socketService.leaveRoom(`room_${createdRoomCode}`);
    }
    setCreatedRoomCode(null);
    message.info('Đã hủy phòng riêng.');
  };

  const handleJoinRoom = () => {
    const trimmedCode = inputRoomCode.trim();
    if (!trimmedCode || trimmedCode.length < 4) {
      message.warning('Vui lòng nhập mã phòng hợp lệ (6 chữ số)!');
      return;
    }

    setIsJoining(true);
    socketService.joinRoom(`room_${trimmedCode}`);
    message.loading({ content: `Đang kết nối vào phòng #${trimmedCode}...`, key: 'join_room_page' });

    setTimeout(() => {
      setIsJoining(false);
      message.success({ content: `Đã kết nối thành công vào phòng #${trimmedCode}!`, key: 'join_room_page' });
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-6 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] flex items-center gap-3">
              <Lock className="w-7 h-7 text-[#361e15]" />
              Phòng Riêng Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Tạo phòng riêng tư hoặc nhập mã để thách đấu bạn bè qua mạng Internet trên bất kỳ thiết bị nào.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#e4e2e1] px-3.5 py-1.5 rounded-lg border border-[#d4c3be]">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-[#442a22]">Socket.io Internet Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Hub */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Create Room Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
              <div className="w-10 h-10 rounded-full bg-[#361e15] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#442a22]">
                  Tạo Phòng Riêng Mới
                </h2>
                <p className="text-xs text-[#504441]">
                  Tùy chỉnh thời gian, chọn phe và chia sẻ mã cho bạn bè.
                </p>
              </div>
            </div>

            {!createdRoomCode ? (
              <div className="space-y-6">
                {/* Time Control Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#361e15]" />
                    <span>Thời gian mỗi ván</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[5, 10, 15, 30].map((mins) => (
                      <button
                        key={`room-time-${mins}`}
                        type="button"
                        onClick={() => setTimeControl(mins)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          timeControl === mins
                            ? 'bg-[#361e15] text-white border-[#361e15] shadow-xs'
                            : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be] hover:bg-[#f6f3f2]'
                        }`}
                      >
                        {mins} phút
                      </button>
                    ))}
                  </div>
                </div>

                {/* Side Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#361e15]" />
                    <span>Chọn phe ban đầu</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSide('random')}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        side === 'random'
                          ? 'bg-[#361e15] text-white border-[#361e15]'
                          : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be]'
                      }`}
                    >
                      Ngẫu nhiên
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('red')}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        side === 'red'
                          ? 'bg-red-800 text-white border-red-800'
                          : 'bg-[#fcf9f8] text-red-900 border-[#d4c3be]'
                      }`}
                    >
                      Cầm Đỏ (Đi trước)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('black')}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        side === 'black'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-[#fcf9f8] text-stone-900 border-[#d4c3be]'
                      }`}
                    >
                      Cầm Đen (Đi sau)
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>TẠO PHÒNG VÀ LẤY MÃ KHAI CUỘC</span>
                </button>
              </div>
            ) : (
              /* Waiting Lobby Active */
              <div className="bg-[#fcf9f8] border-2 border-dashed border-[#361e15]/40 rounded-2xl p-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-bounce">
                  <Users className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#504441] font-serif">Mã phòng riêng của bạn:</p>
                  <div className="text-4xl font-mono font-black text-[#361e15] tracking-widest my-3 select-all">
                    #{createdRoomCode}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="bg-[#361e15] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-[#26140e] cursor-pointer transition-all"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Đã sao chép mã!' : 'Sao chép mã phòng'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelCreatedRoom}
                    className="bg-white border border-[#d4c3be] text-[#504441] hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy phòng
                  </button>
                </div>

                <div className="pt-4 border-t border-[#d4c3be]/60 flex items-center justify-center gap-2 text-xs text-[#504441]">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                  <span>Đang chờ đối thủ nhập mã trên bất kỳ mạng Internet nào...</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Join Room & Quick Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Join Room Panel */}
            <div className="bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#5d4037] flex items-center justify-center text-white">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#442a22]">
                    Tham Gia Bằng Mã Phòng
                  </h2>
                  <p className="text-xs text-[#504441]">
                    Nhập mã phòng 6 chữ số do bạn bè gửi.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#442a22] font-serif mb-2">
                    Mã phòng (6 chữ số)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 839201"
                    maxLength={6}
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value)}
                    className="w-full bg-[#f4f2ee] text-[#1b1c1c] text-center font-mono text-2xl font-bold rounded-xl py-3 border border-[#d4c3be] focus:border-[#361e15] focus:bg-white focus:outline-none tracking-widest transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isJoining ? 'Đang tham gia...' : 'VÀO PHÒNG VÁN ĐẤU'}</span>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#f6f3f2] border border-[#d4c3be] rounded-2xl p-5 space-y-2">
              <h3 className="font-serif font-bold text-sm text-[#442a22] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#361e15]" />
                Tính năng Phòng Riêng
              </h3>
              <p className="text-xs text-[#504441] leading-relaxed">
                Khi tạo phòng riêng, bạn có thể gửi Mã phòng cho bất kỳ ai. Hệ thống hỗ trợ ghép trận không dây qua mạng Internet mà không yêu cầu chung mạng Wi-Fi.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomsPage;
