import React from 'react';
import {
  type BoardGrid,
  type Position,
  getPieceColor,
  getPieceChineseName,
} from '@/utils/xiangqi';
import type { BoardType, PieceStyle } from '@/types/ai';

interface XiangqiBoardProps {
  board: BoardGrid;
  selectedPos: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  hintMove: { from: Position; to: Position } | null;
  onSquareClick: (pos: Position) => void;
  boardType?: BoardType;
  pieceStyle?: PieceStyle;
  isAiThinking?: boolean;
  playerSide?: 'red' | 'black';
}

export const XiangqiBoard: React.FC<XiangqiBoardProps> = ({
  board,
  selectedPos,
  validMoves,
  lastMove,
  hintMove,
  onSquareClick,
  boardType = 'wood',
  isAiThinking = false,
  playerSide = 'red',
}) => {
  const isSelected = (r: number, c: number) =>
    selectedPos ? selectedPos.row === r && selectedPos.col === c : false;

  const isValidMove = (r: number, c: number) =>
    validMoves.some((m) => m.row === r && m.col === c);

  const isLastMoveFrom = (r: number, c: number) =>
    lastMove ? lastMove.from.row === r && lastMove.from.col === c : false;

  const isLastMoveTo = (r: number, c: number) =>
    lastMove ? lastMove.to.row === r && lastMove.to.col === c : false;

  const isHintFrom = (r: number, c: number) =>
    hintMove ? hintMove.from.row === r && hintMove.from.col === c : false;

  const isHintTo = (r: number, c: number) =>
    hintMove ? hintMove.to.row === r && hintMove.to.col === c : false;

  // Board background styles based on boardType
  const getBoardBg = () => {
    switch (boardType) {
      case 'leather':
        return 'bg-[#d8c29d] border-[#5d4037] shadow-xl';
      case 'paper':
        return 'bg-[#f4efe6] border-[#8d6e63] shadow-md';
      case 'wood':
      default:
        return 'bg-[#eed7a1] border-[#442a22] shadow-2xl';
    }
  };

  return (
    <div className="relative w-full max-w-[620px] aspect-[9/10] mx-auto select-none p-3 sm:p-5 rounded-2xl border-4 transition-all duration-300">
      <div
        className={`w-full h-full relative rounded-xl border-2 border-[#442a22] ${getBoardBg()} overflow-hidden`}
      >
        {/* SVG Grid Layer for Board Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 900 1000"
          preserveAspectRatio="none"
        >
          {/* Horizontal lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="50"
              y1={50 + i * 100}
              x2="850"
              y2={50 + i * 100}
              stroke="#5c3a21"
              strokeWidth="3"
            />
          ))}

          {/* Vertical lines (Top side 0-4, Bottom side 5-9) */}
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 50 + i * 100;
            if (i === 0 || i === 8) {
              // Outer border vertical lines run full length
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1="50"
                  x2={x}
                  y2="950"
                  stroke="#5c3a21"
                  strokeWidth="3"
                />
              );
            }
            return (
              <React.Fragment key={`v-${i}`}>
                {/* Top board segment */}
                <line
                  x1={x}
                  y1="50"
                  x2={x}
                  y2="450"
                  stroke="#5c3a21"
                  strokeWidth="3"
                />
                {/* Bottom board segment */}
                <line
                  x1={x}
                  y1="550"
                  x2={x}
                  y2="950"
                  stroke="#5c3a21"
                  strokeWidth="3"
                />
              </React.Fragment>
            );
          })}

          {/* Palaces Diagonal X Lines */}
          {/* Top Palace (Black) */}
          <line
            x1="350"
            y1="50"
            x2="550"
            y2="250"
            stroke="#5c3a21"
            strokeWidth="2"
          />
          <line
            x1="550"
            y1="50"
            x2="350"
            y2="250"
            stroke="#5c3a21"
            strokeWidth="2"
          />

          {/* Bottom Palace (Red) */}
          <line
            x1="350"
            y1="750"
            x2="550"
            y2="950"
            stroke="#5c3a21"
            strokeWidth="2"
          />
          <line
            x1="550"
            y1="750"
            x2="350"
            y2="950"
            stroke="#5c3a21"
            strokeWidth="2"
          />

          {/* River Text */}
          <text
            x="250"
            y="515"
            fill="#5c3a21"
            fontSize="42"
            fontFamily="serif"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            opacity="0.8"
          >
            楚 河
          </text>
          <text
            x="650"
            y="515"
            fill="#5c3a21"
            fontSize="42"
            fontFamily="serif"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            opacity="0.8"
          >
            漢 界
          </text>
        </svg>

            <div className={`absolute inset-0 grid grid-rows-10 grid-cols-9 ${playerSide === 'black' ? 'rotate-180' : ''}`}>
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 9 }).map((__, c) => {
              const piece = board[r][c];
              const pieceColor = getPieceColor(piece);
              const name = getPieceChineseName(piece);
              const selected = isSelected(r, c);
              const valid = isValidMove(r, c);
              const lastFrom = isLastMoveFrom(r, c);
              const lastTo = isLastMoveTo(r, c);
              const hintFrom = isHintFrom(r, c);
              const hintTo = isHintTo(r, c);

              return (
                <div
                  key={`sq-${r}-${c}`}
                  onClick={() => onSquareClick({ row: r, col: c })}
                  className="relative flex items-center justify-center cursor-pointer group"
                >
                  {/* Last move highlight */}
                  {(lastFrom || lastTo) && (
                    <div className="absolute inset-1 rounded-full bg-amber-500/30 border-2 border-amber-600 animate-pulse pointer-events-none" />
                  )}

                  {/* AI Hint highlight */}
                  {(hintFrom || hintTo) && (
                    <div className="absolute inset-1 rounded-full bg-emerald-500/35 border-2 border-emerald-600 animate-bounce pointer-events-none" />
                  )}

                  {/* Valid move target marker */}
                  {valid && (
                    <div className="absolute z-20 w-5 h-5 rounded-full bg-emerald-600/80 border-2 border-white shadow-md animate-ping" />
                  )}

                  {/* Render Piece */}
                  {piece && (
                    <div
                      className={`relative z-10 w-[82%] aspect-square rounded-full flex items-center justify-center font-serif font-black text-lg sm:text-2xl lg:text-3xl transition-all duration-200 transform ${
                        playerSide === 'black' ? 'rotate-180' : ''
                      } ${
                        selected
                          ? 'scale-110 ring-4 ring-amber-500 shadow-2xl -translate-y-1 z-30'
                          : 'hover:scale-105 active:scale-95 shadow-lg'
                      } ${
                        pieceColor === 'red'
                          ? 'bg-gradient-to-br from-[#fffdfa] via-[#f7f0e6] to-[#e4d3bd] text-[#b71c1c] border-2 border-[#b71c1c] shadow-red-900/20'
                          : 'bg-gradient-to-br from-[#423835] via-[#2c2422] to-[#1a1413] text-[#f5efe6] border-2 border-[#1a1413] shadow-black/30'
                      }`}
                    >
                      {/* Inner piece ring decoration */}
                      <div
                        className={`w-[85%] h-[85%] rounded-full border flex items-center justify-center ${
                          pieceColor === 'red'
                            ? 'border-[#b71c1c]/40 bg-[#fffbf7]'
                            : 'border-[#f5efe6]/30 bg-[#2c2422]'
                        }`}
                      >
                        <span className="drop-shadow-xs">{name}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Engine thinking overlay indicator */}
        {isAiThinking && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-[#361e15]/90 text-white px-6 py-3 rounded-full shadow-2xl border border-[#5d4037] flex items-center gap-3 animate-pulse">
              <span className="w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <span className="font-serif text-sm font-bold tracking-wide">
                Pikafish AI đang suy tính nước đi...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XiangqiBoard;
