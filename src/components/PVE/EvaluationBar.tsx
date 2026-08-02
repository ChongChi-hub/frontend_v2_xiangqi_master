import React from 'react';
import { Cpu } from 'lucide-react';
import type { AIDifficultyLevel } from '@/types/ai';

interface EvaluationBarProps {
  score: number;
  difficulty: AIDifficultyLevel;
  playerSide: 'red' | 'black';
  turn: 'red' | 'black';
  isThinking?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  score,
  difficulty,
  playerSide,
  turn,
  isThinking = false,
}) => {
  // Score range mapping (-10.0 to +10.0 -> 0% to 100%)
  const clampedScore = Math.max(-10, Math.min(10, score));
  const redPercentage = Math.round(((clampedScore + 10) / 20) * 100);

  const getDifficultyTitle = (diff: AIDifficultyLevel) => {
    switch (diff) {
      case 'beginner':
        return 'Nhập môn (Cấp 1)';
      case 'apprentice':
        return 'Tập sự (Cấp 2)';
      case 'intermediate':
        return 'Trung cấp (Cấp 3)';
      case 'master':
        return 'Cao thủ (Cấp 4)';
      case 'grandmaster':
        return 'Đại kiện tướng (Cấp 5)';
      default:
        return 'AI';
    }
  };

  return (
    <div className="w-full bg-[#ffffff] border border-[#d4c3be] rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#361e15]" />
          <span className="font-serif font-bold text-sm text-[#442a22]">
            Pikafish AVX2 Engine
          </span>
          <span className="text-xs px-2 py-0.5 bg-[#f0eded] text-[#504441] rounded-full font-semibold">
            {getDifficultyTitle(difficulty)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isThinking && (
            <span className="text-xs font-semibold text-amber-700 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Đang tính toán...
            </span>
          )}
          {!isThinking && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md text-white ${turn === 'red' ? 'bg-[#b71c1c]' : 'bg-[#1b1c1c]'}`}>
              Lượt: {turn === 'red' ? 'Đỏ' : 'Đen'}
            </span>
          )}
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#442a22] text-white rounded-md">
            Score: {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Progress Bar for Advantage */}
      <div className="w-full h-3 bg-[#2c2422] rounded-full overflow-hidden flex border border-[#d4c3be]">
        <div
          className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
          style={{ width: `${redPercentage}%` }}
        />
        <div
          className="h-full bg-[#2c2422] transition-all duration-500"
          style={{ width: `${100 - redPercentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-semibold text-[#504441]">
        <span className="text-red-700 font-bold">
          {playerSide === 'red' ? 'Người chơi (Đỏ)' : 'Pikafish (Đỏ)'}: {redPercentage}%
        </span>
        <span className="text-gray-900 font-bold">
          {playerSide === 'black' ? 'Người chơi (Đen)' : 'Pikafish (Đen)'}: {100 - redPercentage}%
        </span>
      </div>
    </div>
  );
};

export default EvaluationBar;
