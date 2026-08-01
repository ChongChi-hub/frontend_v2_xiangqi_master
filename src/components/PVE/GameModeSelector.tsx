import React from 'react';
import type { GameMode } from '@/types/ai';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  selectedMode,
  onSelect,
}) => {
  return (
    <section className="space-y-4">
      <div className="border-b border-[#d4c3be] pb-2">
        <h3 className="text-2xl font-serif font-bold text-[#442a22]">Chế độ chơi</h3>
      </div>

      <div className="space-y-3">
        {/* Practice Mode */}
        <label
          onClick={() => onSelect('practice')}
          className={`flex items-start p-4 border rounded-xl cursor-pointer group transition-all ${
            selectedMode === 'practice'
              ? 'border-[#442a22] bg-[#5d4037]/10 shadow-sm'
              : 'border-[#d4c3be] hover:border-[#442a22]/50 bg-[#ffffff]'
          }`}
        >
          <input
            type="radio"
            name="game-mode"
            checked={selectedMode === 'practice'}
            onChange={() => onSelect('practice')}
            className="mt-1 w-4 h-4 text-[#442a22] focus:ring-[#442a22] border-[#d4c3be] accent-[#442a22]"
          />
          <div className="ml-3">
            <p className="text-base font-bold text-[#442a22] font-serif">Chế độ luyện tập</p>
            <p className="text-sm text-[#504441] mt-0.5">
              Cho phép hoàn nước, nhận gợi ý và xem phân tích trận đấu.
            </p>
          </div>
        </label>

        {/* Ranked Mode */}
        <label
          onClick={() => onSelect('ranked')}
          className={`flex items-start p-4 border rounded-xl cursor-pointer group transition-all ${
            selectedMode === 'ranked'
              ? 'border-[#442a22] bg-[#5d4037]/10 shadow-sm'
              : 'border-[#d4c3be] hover:border-[#442a22]/50 bg-[#ffffff]'
          }`}
        >
          <input
            type="radio"
            name="game-mode"
            checked={selectedMode === 'ranked'}
            onChange={() => onSelect('ranked')}
            className="mt-1 w-4 h-4 text-[#442a22] focus:ring-[#442a22] border-[#d4c3be] accent-[#442a22]"
          />
          <div className="ml-3">
            <p
              className={`text-base font-bold font-serif transition-colors ${
                selectedMode === 'ranked'
                  ? 'text-[#442a22]'
                  : 'text-[#504441] group-hover:text-[#442a22]'
              }`}
            >
              Chế độ tính điểm
            </p>
            <p className="text-sm text-[#5e5e5b] mt-0.5">
              Tích lũy điểm ELO. Không hỗ trợ hoàn nước hoặc gợi ý.
            </p>
          </div>
        </label>
      </div>
    </section>
  );
};

export default GameModeSelector;
