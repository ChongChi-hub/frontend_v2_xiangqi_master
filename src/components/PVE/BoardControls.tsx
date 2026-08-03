import React from 'react';
import { Lightbulb, Flag, RotateCcw } from 'lucide-react';

interface BoardControlsProps {
  onHint: () => void;
  onResign: () => void;
  onRestart: () => void;
  isAiThinking?: boolean;
  isHintLoading?: boolean;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  onHint,
  onResign,
  onRestart,
  isAiThinking = false,
  isHintLoading = false,
}) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">

      <button
        type="button"
        onClick={onHint}
        disabled={isAiThinking || isHintLoading}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fff8e1] hover:bg-[#ffecb3] text-[#b78103] font-semibold text-xs sm:text-sm rounded-xl border border-[#ffe082] shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <Lightbulb className="w-4 h-4" />
        <span>{isHintLoading ? 'Đang nghĩ...' : 'Gợi ý AI'}</span>
      </button>

      <button
        type="button"
        onClick={onRestart}
        disabled={isAiThinking}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] hover:bg-[#f4efe6] text-[#442a22] font-semibold text-xs sm:text-sm rounded-xl border border-[#d4c3be] shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Ván mới</span>
      </button>

      <button
        type="button"
        onClick={onResign}
        disabled={isAiThinking}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdf2f2] hover:bg-[#fde8e8] text-[#b71c1c] font-semibold text-xs sm:text-sm rounded-xl border border-[#f8b4b4] shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <Flag className="w-4 h-4" />
        <span>Xin hòa / Đầu hàng</span>
      </button>
    </div>
  );
};

export default BoardControls;
