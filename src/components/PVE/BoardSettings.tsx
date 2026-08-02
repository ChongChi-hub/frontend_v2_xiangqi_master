import React from 'react';
import type { BoardType } from '@/types/ai';

interface BoardSettingsProps {
  selectedBoard: BoardType;
  playerSide: 'red' | 'black';
  onSelectBoard: (board: BoardType) => void;
  onSelectSide: (side: 'red' | 'black') => void;
}

export const BoardSettings: React.FC<BoardSettingsProps> = ({
  selectedBoard,
  playerSide,
  onSelectBoard,
  onSelectSide,
}) => {
  return (
    <section className="space-y-4">
      <div className="border-b border-[#d4c3be] pb-2">
        <h3 className="text-2xl font-serif font-bold text-[#442a22]">Cài đặt bàn cờ</h3>
      </div>

      <div className="bg-[#ffffff] border border-[#d4c3be] rounded-xl p-5 space-y-6">
        {/* Board Type Selection */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#442a22] font-serif">Loại bàn cờ</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onSelectBoard('wood')}
              title="Bàn gỗ"
              className={`w-12 h-12 rounded-lg border-2 relative overflow-hidden transition-all cursor-pointer ${
                selectedBoard === 'wood'
                  ? 'border-[#442a22] shadow-md ring-2 ring-[#442a22]/30 scale-105'
                  : 'border-[#d4c3be] hover:border-[#827470]'
              } bg-[#D2B48C]`}
            >
              <span className="sr-only">Bàn gỗ</span>
              <div className="absolute inset-0 bg-[#442a22]/10 pointer-events-none" />
            </button>

            <button
              type="button"
              onClick={() => onSelectBoard('leather')}
              title="Bàn da"
              className={`w-12 h-12 rounded-lg border-2 relative overflow-hidden transition-all cursor-pointer ${
                selectedBoard === 'leather'
                  ? 'border-[#442a22] shadow-md ring-2 ring-[#442a22]/30 scale-105'
                  : 'border-[#d4c3be] hover:border-[#827470]'
              } bg-[#8B4513]`}
            >
              <span className="sr-only">Bàn da</span>
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </button>

            <button
              type="button"
              onClick={() => onSelectBoard('paper')}
              title="Bàn giấy"
              className={`w-12 h-12 rounded-lg border-2 relative overflow-hidden transition-all cursor-pointer ${
                selectedBoard === 'paper'
                  ? 'border-[#442a22] shadow-md ring-2 ring-[#442a22]/30 scale-105'
                  : 'border-[#d4c3be] hover:border-[#827470]'
              } bg-[#F5F5DC]`}
            >
              <span className="sr-only">Bàn giấy</span>
              <div className="absolute inset-0 bg-[#827470]/10 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Side Selection */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#442a22] font-serif">Chọn phe (Bắt đầu lại)</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onSelectSide('red')}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                playerSide === 'red' ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[#ffffff] text-[#ba1a1a] font-serif text-xl shadow-sm ${
                  playerSide === 'red' ? 'border-[#442a22] ring-2 ring-[#442a22]/20' : 'border-[#d4c3be]'
                }`}
              >
                帥
              </div>
              <span className={`text-xs ${playerSide === 'red' ? 'font-bold text-[#442a22]' : 'text-[#504441]'}`}>
                Cầm Đỏ (Đi trước)
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSide('black')}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                playerSide === 'black' ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[#1b1c1c] text-[#ffffff] font-serif text-xl shadow-sm ${
                  playerSide === 'black' ? 'border-[#442a22] ring-2 ring-[#442a22]/20' : 'border-[#d4c3be]'
                }`}
              >
                將
              </div>
              <span className={`text-xs ${playerSide === 'black' ? 'font-bold text-[#442a22]' : 'text-[#504441]'}`}>
                Cầm Đen (Đi sau)
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardSettings;
