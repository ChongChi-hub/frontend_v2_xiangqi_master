import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { Play } from 'lucide-react';
import { DifficultySelector } from '@/components/PVE/DifficultySelector';
import { GameModeSelector } from '@/components/PVE/GameModeSelector';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import type { AIDifficultyLevel, GameMode, BoardType, PieceStyle } from '@/types/ai';

export const PvePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlDifficulty = searchParams.get('difficulty') as AIDifficultyLevel | null;

  const [difficulty, setDifficulty] = useState<AIDifficultyLevel>(
    urlDifficulty || 'apprentice'
  );
  const [mode, setMode] = useState<GameMode>('practice');
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (urlDifficulty) {
      setDifficulty(urlDifficulty);
    }
  }, [urlDifficulty]);

  const handleStartGame = () => {
    setIsStarting(true);
    message.loading({ content: 'Đang khởi tạo bàn cờ và kết nối Engine AI...', key: 'pve_start' });

    setTimeout(() => {
      setIsStarting(false);
      message.success({
        content: `Đã bắt đầu trận đấu với AI (${
          difficulty === 'beginner'
            ? 'Nhập môn'
            : difficulty === 'apprentice'
            ? 'Tập sự'
            : difficulty === 'intermediate'
            ? 'Trung cấp'
            : difficulty === 'master'
            ? 'Cao thủ'
            : 'Đại kiện tướng'
        } - ${mode === 'practice' ? 'Luyện tập' : 'Tính điểm'})!`,
        key: 'pve_start',
        duration: 4,
      });
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] min-h-screen text-[#1b1c1c]">
      {/* Top Banner / Title Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-6 md:px-16 py-6 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#442a22]">
              Đấu với AI
            </h1>
            <p className="text-sm text-[#504441] mt-1 font-sans">
              Rèn luyện kỹ năng Cờ Tướng cùng trí tuệ nhân tạo thông minh.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#e4e2e1] px-4 py-2 rounded-lg border border-[#d4c3be]">
            <span className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#442a22]">Engine Ready</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-8 space-y-10 flex-1">
        {/* Section 1: Difficulty Selection */}
        <DifficultySelector
          selectedDifficulty={difficulty}
          onSelect={(level) => setDifficulty(level)}
        />

        {/* Grid for Modes and Board Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 2: Play Modes */}
          <GameModeSelector
            selectedMode={mode}
            onSelect={(selectedMode) => setMode(selectedMode)}
          />

          {/* Section 3: Board Settings */}
          <BoardSettings
            selectedBoard={boardType}
            selectedPieceStyle={pieceStyle}
            onSelectBoard={(board) => setBoardType(board)}
            onSelectPieceStyle={(style) => setPieceStyle(style)}
          />
        </div>

        {/* Start Match Action Section */}
        <div className="flex justify-center pt-6 pb-12">
          <button
            type="button"
            onClick={handleStartGame}
            disabled={isStarting}
            className="bg-[#442a22] text-[#ffffff] px-10 py-4 rounded-xl font-serif text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer border border-[#5d4037] disabled:opacity-50"
          >
            <Play className="w-6 h-6 fill-current text-white" />
            <span>{isStarting ? 'Đang chuẩn bị...' : 'Bắt đầu trận đấu'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default PvePage;
