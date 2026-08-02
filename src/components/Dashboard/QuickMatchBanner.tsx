import React, { useState, useEffect } from 'react';
import { Swords, Loader2, XCircle, Users } from 'lucide-react';
import { message } from 'antd';

interface QuickMatchBannerProps {
  onFindMatch?: () => void;
  onCancelMatch?: () => void;
  onCreateRoom?: () => void;
  isSearchingExternal?: boolean;
}

export const QuickMatchBanner: React.FC<QuickMatchBannerProps> = ({
  onFindMatch,
  onCancelMatch,
  onCreateRoom,
  isSearchingExternal = false,
}) => {
  const [internalSearching, setInternalSearching] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);

  const isSearching = isSearchingExternal || internalSearching;

  useEffect(() => {
    if (!isSearching) {
      return;
    }
    const timer = setInterval(() => {
      setSearchSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      setSearchSeconds(0);
    };
  }, [isSearching]);

  const handleToggleMatchmaking = () => {
    if (isSearching) {
      setInternalSearching(false);
      message.info('Đã hủy tìm trận.');
      if (onCancelMatch) onCancelMatch();
    } else {
      setInternalSearching(true);
      message.success('Đang tìm kiếm đối thủ PvP qua Internet...');
      if (onFindMatch) onFindMatch();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Quick PvP Matchmaking Banner (2 cols) */}
      <div className="sm:col-span-2">
        <button
          type="button"
          onClick={handleToggleMatchmaking}
          className={`w-full h-full group rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all duration-300 transform active:scale-[0.99] shadow-md border cursor-pointer ${
            isSearching
              ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white border-[#ba1a1a] animate-pulse'
              : 'bg-[#5d4037] hover:bg-[#442a22] text-[#ffffff] border-[#442a22]'
          }`}
        >
          {isSearching ? (
            <>
              <div className="flex items-center gap-2">
                <Loader2 className="w-9 h-9 animate-spin" />
                <XCircle className="w-5 h-5 opacity-80 group-hover:scale-125 transition-transform" />
              </div>
              <span className="font-serif text-xl font-bold uppercase tracking-[0.15em]">
                ĐANG TÌM TRẬN ({formatSeconds(searchSeconds)})
              </span>
              <span className="text-xs font-medium opacity-90 font-sans">
                Bấm vào đây để HỦY TÌM TRẬN
              </span>
            </>
          ) : (
            <>
              <Swords className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <span className="font-serif text-xl font-bold uppercase tracking-[0.15em]">
                TÌM TRẬN INTERNET PVP
              </span>
              <span className="text-xs font-semibold opacity-80 font-sans">
                Ghép đấu tự động qua mạng Internet (~30s)
              </span>
            </>
          )}
        </button>
      </div>

      {/* Create Custom Room Card (1 col) */}
      <div className="sm:col-span-1">
        <button
          type="button"
          onClick={onCreateRoom}
          className="w-full h-full group bg-white hover:bg-[#f6f3f2] text-[#361e15] border-2 border-[#d4c3be] hover:border-[#361e15] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#361e15]/10 flex items-center justify-center text-[#361e15] group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <span className="font-serif text-lg font-bold">TẠO PHÒNG CHƠI</span>
          <span className="text-xs text-[#504441] font-sans font-medium text-center">
            Mã phòng riêng tư & Nhập mã bạn bè
          </span>
        </button>
      </div>
    </section>
  );
};

export default QuickMatchBanner;
