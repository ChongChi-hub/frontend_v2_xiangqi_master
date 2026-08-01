import React, { useState, useEffect } from 'react';
import { Swords, Loader2, XCircle } from 'lucide-react';
import { message } from 'antd';

interface QuickMatchBannerProps {
  onFindMatch?: () => void;
  onCancelMatch?: () => void;
  isSearchingExternal?: boolean;
}

export const QuickMatchBanner: React.FC<QuickMatchBannerProps> = ({
  onFindMatch,
  onCancelMatch,
  isSearchingExternal = false,
}) => {
  const [isSearching, setIsSearching] = useState(isSearchingExternal);
  const [searchSeconds, setSearchSeconds] = useState(0);

  useEffect(() => {
    setIsSearching(isSearchingExternal);
  }, [isSearchingExternal]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleToggleMatchmaking = () => {
    if (isSearching) {
      setIsSearching(false);
      message.info('Đã hủy tìm trận.');
      if (onCancelMatch) onCancelMatch();
    } else {
      setIsSearching(true);
      message.success('Đang tìm kiếm đối thủ PvP...');
      if (onFindMatch) onFindMatch();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <section>
      <button
        type="button"
        onClick={handleToggleMatchmaking}
        className={`w-full group rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.99] shadow-md border cursor-pointer ${
          isSearching
            ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white border-[#ba1a1a] animate-pulse'
            : 'bg-[#5d4037] hover:bg-[#442a22] text-[#ffffff] border-[#442a22]'
        }`}
      >
        {isSearching ? (
          <>
            <div className="flex items-center gap-2">
              <Loader2 className="w-10 h-10 animate-spin" />
              <XCircle className="w-6 h-6 opacity-80 group-hover:scale-125 transition-transform" />
            </div>
            <span className="font-serif text-2xl font-bold uppercase tracking-[0.15em]">
              ĐANG TÌM TRẬN ({formatSeconds(searchSeconds)})
            </span>
            <span className="text-sm font-medium opacity-90 font-sans">
              Bấm vào đây để HỦY TÌM TRẬN
            </span>
          </>
        ) : (
          <>
            <Swords className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-2xl font-bold uppercase tracking-[0.2em]">
              TÌM TRẬN XẾP HẠNG
            </span>
            <span className="text-xs font-semibold opacity-80 font-sans">
              Ước tính thời gian chờ: ~30 giây
            </span>
          </>
        )}
      </button>
    </section>
  );
};

export default QuickMatchBanner;
